from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import services.analytics_service as analytics_service

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"]
)

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    stats = analytics_service.get_clinic_stats(db, days=30)
    trend = analytics_service.get_session_volume_trend(db, days=14)
    symptoms = analytics_service.get_common_symptoms(db, limit=5)
    
    return {
        "stats": stats,
        "trend": trend,
        "symptoms": symptoms
    }
