import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from services.deepgram_service import DeepgramLiveTranscription
from services.groq_service import analyze_transcript

router = APIRouter(
    prefix="/ws",
    tags=["websockets"]
)

logger = logging.getLogger("audio_handler")

async def get_session_transcript(session_id: str, db: Session) -> str:
    transcripts = db.query(models.Transcript).filter(models.Transcript.session_id == session_id).order_by(models.Transcript.timestamp).all()
    return "".join(f"{t.speaker}: {t.text}\n" for t in transcripts)

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

    loop = asyncio.get_event_loop()

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

    dg_service = DeepgramLiveTranscription(on_transcript)

    # connect() is now a native async call
    connected = await dg_service.connect()
    print(f"DEBUG: Deepgram connect result: {connected}")
    if not connected:
        logger.error("Failed to connect to Deepgram")
        await websocket.close(code=1011, reason="Deepgram unavailable")
        db.close()
        return

    # Background Assessment Loop
    async def run_assessment_loop():
        try:
            while True:
                await asyncio.sleep(15)
                full_text = await get_session_transcript(session_id, db)
                if not full_text.strip():
                    continue
                logger.info(f"Running Groq assessment for {session_id}")
                assessment_json = await analyze_transcript(full_text)

                assessment = db.query(models.Assessment).filter(models.Assessment.session_id == session_id).first()
                if assessment:
                    import json
                    if "extracted" in assessment_json:
                        meds = assessment_json["extracted"].get("medications", [])
                        assessment.medications_json = json.dumps(meds)
                        hx = assessment_json["extracted"].get("past_medical_history", [])
                        assessment.medical_history_json = json.dumps(hx)
                    if "missing_questions" in assessment_json:
                        assessment.missing_questions_json = json.dumps(assessment_json["missing_questions"])
                    if "soap_summary" in assessment_json:
                        assessment.final_summary_text = json.dumps(assessment_json["soap_summary"])
                    db.commit()
                try:
                    await websocket.send_json({"type": "ui_update", "data": assessment_json})
                except Exception:
                    pass
        except asyncio.CancelledError:
            pass

    assessment_task = asyncio.create_task(run_assessment_loop())

    try:
        while True:
            audio_chunk = await websocket.receive_bytes()
            print(f"DEBUG: Received {len(audio_chunk)} bytes — forwarding to Deepgram")
            await dg_service.send_audio(audio_chunk)

    except WebSocketDisconnect:
        logger.info(f"WS disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WS error for {session_id}: {e}")
    finally:
        assessment_task.cancel()
        await dg_service.finish()
        db.close()
