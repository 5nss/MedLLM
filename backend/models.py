import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from database import Base

class Patient(Base):
    __tablename__ = "patients"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name       = Column(String, nullable=False)
    dob        = Column(String, nullable=False)          # "YYYY-MM-DD"
    mrn        = Column(String, unique=True, nullable=False)  # Medical Record Number
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions   = relationship("Session", back_populates="patient")

class Session(Base):
    __tablename__ = "sessions"
    id                = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id        = Column(String, ForeignKey("patients.id"), nullable=False)
    status            = Column(Enum("active", "review", "completed", name="session_status"), default="active")
    current_complaint = Column(String, nullable=True)
    created_at        = Column(DateTime, default=datetime.utcnow)
    
    patient           = relationship("Patient", back_populates="sessions")
    transcripts       = relationship("Transcript", back_populates="session")
    assessment        = relationship("Assessment", back_populates="session", uselist=False)

class Transcript(Base):
    __tablename__ = "transcripts"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    speaker    = Column(String, nullable=False)   # "Nurse" | "Patient"
    text       = Column(Text, nullable=False)
    timestamp  = Column(DateTime, default=datetime.utcnow)
    
    session    = relationship("Session", back_populates="transcripts")

class Assessment(Base):
    __tablename__ = "assessments"
    id                    = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id            = Column(String, ForeignKey("sessions.id"), nullable=False)
    medical_history_json  = Column(Text)   # JSON string
    medications_json      = Column(Text)   # JSON string
    missing_questions_json= Column(Text)   # JSON string (SAMPLE gaps)
    final_summary_text    = Column(Text)
    updated_at            = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    session               = relationship("Session", back_populates="assessment")
