from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/sessions",
    tags=["sessions"]
)

@router.post("/{patient_id}", response_model=schemas.SessionResponse)
def create_session(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    new_session = models.Session(patient_id=patient_id, status="active")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    # Also create an empty assessment for the session
    new_assessment = models.Assessment(session_id=new_session.id)
    db.add(new_assessment)
    db.commit()
    
    return new_session

@router.get("/{session_id}", response_model=schemas.SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.patch("/{session_id}/status", response_model=schemas.SessionResponse)
def update_session_status(session_id: str, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if status not in ["active", "review", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
        
    session.status = status
    db.commit()
    db.refresh(session)
    return session

@router.get("", response_model=list[schemas.SessionResponse])
def get_active_sessions(db: Session = Depends(get_db)):
    sessions = db.query(models.Session).filter(models.Session.status == "active").all()
    return sessions
