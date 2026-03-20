import logging
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from services.soniox_service import SonioxLiveTranscription
from services.groq_service import analyze_transcript, analyze_roles

router = APIRouter(
    prefix="/ws",
    tags=["websockets"]
)

logger = logging.getLogger("audio_handler")

async def get_session_transcript(session_id: str, db: Session) -> str:
    transcripts = db.query(models.Transcript).filter(models.Transcript.session_id == session_id).order_by(models.Transcript.timestamp).all()
    # Include Speaker prefix so the LLM understands who is talking
    return "".join(f"Speaker {t.speaker}: {t.text}\n" for t in transcripts)

@router.websocket("/audio/{session_id}")
async def websocket_audio_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"DEBUG: WebSocket accepted — session_id: {session_id}")

    db = SessionLocal()
    session_model = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session_model:
        print(f"DEBUG: Session {session_id} NOT found in DB — closing WS")
        await websocket.close(code=1008, reason="Session not found")
        db.close()
        return
    print("DEBUG: Session found in DB. Proceeding...")

    assessment_event = asyncio.Event()
    loop_state = {"new_word_count": 0}

    async def on_transcript(speaker: str, text: str):
        print(f"DEBUG: on_transcript called — {speaker}: {text}")
        new_t = models.Transcript(session_id=session_id, speaker=speaker, text=text)
        db.add(new_t)
        db.commit()
        try:
            await websocket.send_json({
                "type": "transcript",
                "data": {
                    "speaker": speaker,
                    "text": text,
                    "timestamp": new_t.timestamp.isoformat()
                }
            })
        except Exception as e:
            logger.error(f"Error pushing transcript to WS: {e}")
            
        # Optimization: Event-Driven LLM Trigger
        word_count = len(text.split())
        loop_state["new_word_count"] += word_count
        
        # Trigger if >= 15 words. Removed strict punctuation check as live STT often omits it.
        if loop_state["new_word_count"] >= 30:
            assessment_event.set()

    stt_service = SonioxLiveTranscription(on_transcript)
    connected = await stt_service.connect()
    print(f"DEBUG: Soniox connect result: {connected}")
    if not connected:
        logger.error("Failed to connect to Soniox")
        await websocket.close(code=1011, reason="Soniox unavailable")
        db.close()
        return

    db_assessment = db.query(models.Assessment).filter(models.Assessment.session_id == session_id).first()
    if not db_assessment:
        db_assessment = models.Assessment(session_id=session_id)
        db.add(db_assessment)
        db.commit()

    # Send cached roles immediately on connect if they exist
    if db_assessment and db_assessment.speaker_roles_json:
        try:
            await websocket.send_json({
                "type": "speaker_roles", 
                "data": json.loads(db_assessment.speaker_roles_json)
            })
        except:
            pass

    alerted_medications = set()
    if db_assessment and db_assessment.medications_json:
        try:
            meds = json.loads(db_assessment.medications_json)
            for m in meds:
                med_name = m if isinstance(m, str) else m.get("medication", str(m))
                alerted_medications.add(med_name.lower())
        except Exception:
            pass

    async def run_assessment_loop():
        try:
            while True:
                await assessment_event.wait()
                assessment_event.clear()
                loop_state["new_word_count"] = 0
                
                full_text = await get_session_transcript(session_id, db)
                if not full_text.strip():
                    continue
                    
                assessment = db.query(models.Assessment).filter(models.Assessment.session_id == session_id).first()
                if not assessment:
                    continue

                # Anchor & Cache: Determine roles once.
                roles = None
                if assessment.speaker_roles_json:
                    roles = json.loads(assessment.speaker_roles_json)
                else:
                    # Wait until we have a substantial chunk of text to determine roles reliably
                    if len(full_text.split()) >= 30:
                        logger.info(f"Running Initial Groq Role Assessment for {session_id}")
                        roles = await analyze_roles(full_text)
                        if roles:
                            logger.info(f"Caching new speaker roles: {roles}")
                            assessment.speaker_roles_json = json.dumps(roles)
                            db.commit()
                            try:
                                await websocket.send_json({"type": "speaker_roles", "data": roles})
                            except Exception:
                                pass
                
                # We always run the main assessment when the event fires
                logger.info(f"Running Groq Clinical Assessment for {session_id}")
                assessment_json = await analyze_transcript(full_text, roles=roles)

                if "extracted" in assessment_json:
                    meds = assessment_json["extracted"].get("medications", [])
                    assessment.medications_json = json.dumps(meds)
                    hx = assessment_json["extracted"].get("past_medical_history", [])
                    assessment.medical_history_json = json.dumps(hx)
                    
                    # Emit Medication Alerts
                    new_meds = []
                    for m in meds:
                        med_name = m if isinstance(m, str) else m.get("medication", str(m))
                        if med_name.lower() not in alerted_medications:
                            new_meds.append(m)
                            alerted_medications.add(med_name.lower())
                            
                    if new_meds:
                        try:
                            await websocket.send_json({"type": "new_medications_detected", "data": new_meds})
                        except Exception as e:
                            logger.error(f"Failed to push new meds alert: {e}")

                if "missing_questions" in assessment_json:
                    assessment.missing_questions_json = json.dumps(assessment_json["missing_questions"])
                if "soap_summary" in assessment_json:
                    assessment.final_summary_text = json.dumps(assessment_json["soap_summary"])
                
                session_model.status = "active"
                db.commit()
                
                try:
                    logger.info(f"Broadcasting UI update for session {session_id}")
                    await websocket.send_json({"type": "ui_update", "data": assessment_json})
                except Exception:
                    pass
        except asyncio.CancelledError:
            pass

    assessment_task = asyncio.create_task(run_assessment_loop())

    try:
        while True:
            message = await websocket.receive()
            if "bytes" in message and message["bytes"]:
                await stt_service.send_audio(message["bytes"])
            elif "text" in message and message["text"]:
                try:
                    data = json.loads(message["text"])
                    if data.get("type") == "medications_verified":
                        verified = data.get("data", [])
                        logger.info(f"Nurse verified meds: {verified}")
                except Exception as e:
                    logger.debug(f"JSON decode error from WS text: {e}")

    except WebSocketDisconnect:
        logger.info(f"WS disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WS error for {session_id}: {e}")
    finally:
        assessment_task.cancel()
        await stt_service.finish()
        db.close()
