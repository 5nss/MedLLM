from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/patients",
    tags=["patients"]
)

@router.get("", response_model=List[schemas.PatientResponse])
def search_patients(search: str = Query("", description="Search by name or MRN"), db: Session = Depends(get_db)):
    if search:
        search_pattern = f"%{search}%"
        patients = db.query(models.Patient).filter(
            (models.Patient.name.ilike(search_pattern)) | 
            (models.Patient.mrn.ilike(search_pattern))
        ).all()
    else:
        patients = db.query(models.Patient).limit(10).all()
    return patients

@router.post("", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.mrn == patient.mrn).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Patient with this MRN already exists")
    
    new_patient = models.Patient(
        name=patient.name,
        dob=patient.dob,
        mrn=patient.mrn
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient
