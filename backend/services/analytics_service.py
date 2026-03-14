from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from datetime import datetime, timedelta

def get_clinic_stats(db: Session, days: int = 30):
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    total_patients = db.query(models.Patient).count()
    active_patients = db.query(models.Session).filter(models.Session.created_at >= cutoff).distinct(models.Session.patient_id).count()
    
    total_sessions = db.query(models.Session).filter(models.Session.created_at >= cutoff).count()
    completed_sessions = db.query(models.Session).filter(
        models.Session.created_at >= cutoff, 
        models.Session.status == "completed"
    ).count()

    total_appointments = db.query(models.Appointment).filter(models.Appointment.created_at >= cutoff).count()
    
    return {
        "total_patients": total_patients,
        "active_patients_last_30d": active_patients,
        "total_sessions_last_30d": total_sessions,
        "completion_rate": round(completed_sessions / total_sessions * 100, 1) if total_sessions > 0 else 0,
        "total_appointments_last_30d": total_appointments
    }

def get_session_volume_trend(db: Session, days: int = 14):
    """Returns number of sessions per day for the last N days."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    # SQLite datetime functions
    # strftime('%Y-%m-%d', created_at)
    results = db.query(
        func.strftime('%Y-%m-%d', models.Session.created_at).label('date'),
        func.count(models.Session.id).label('count')
    ).filter(models.Session.created_at >= cutoff).group_by('date').order_by('date').all()
    
    return [{"date": r.date, "sessions": r.count} for r in results]

def get_common_symptoms(db: Session, limit: int = 5):
    """
    Since symptoms (current_complaint) are free text right now, a simple frequency count.
    In a real app, this would use the structured extracted JSON.
    """
    results = db.query(
        models.Session.current_complaint,
        func.count(models.Session.id).label('count')
    ).filter(models.Session.current_complaint != None).group_by(models.Session.current_complaint).order_by(func.count(models.Session.id).desc()).limit(limit).all()
    
    return [{"symptom": r.current_complaint, "count": r.count} for r in results]
