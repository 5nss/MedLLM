from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class PatientBase(BaseModel):
    name: str
    dob: str
    mrn: str

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SessionBase(BaseModel):
    patient_id: str
    current_complaint: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    id: str
    status: str
    created_at: datetime
    patient: Optional[PatientResponse] = None
    model_config = ConfigDict(from_attributes=True)

class TranscriptBase(BaseModel):
    session_id: str
    speaker: str
    text: str

class TranscriptCreate(TranscriptBase):
    pass

class TranscriptResponse(TranscriptBase):
    id: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class AssessmentBase(BaseModel):
    session_id: str
    medical_history_json: Optional[str] = None
    medications_json: Optional[str] = None
    missing_questions_json: Optional[str] = None
    final_summary_text: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentResponse(AssessmentBase):
    id: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
