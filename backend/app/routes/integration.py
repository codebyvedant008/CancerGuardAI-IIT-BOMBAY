from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/integration/fhir", tags=["Hospital Integration (Mock FHIR)"])

@router.get("/Patient/{patient_id}")
async def get_fhir_patient(patient_id: int, db: Session = Depends(get_db)):
    """Mock FHIR endpoint to retrieve a patient record."""
    patient = db.query(User).filter(User.id == patient_id, User.role == "patient").first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return {
        "resourceType": "Patient",
        "id": str(patient.id),
        "active": True,
        "name": [{"use": "official", "text": patient.full_name}],
        "telecom": [{"system": "email", "value": patient.email}],
        "gender": patient.gender.lower() if patient.gender else "unknown",
        "birthDate": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
    }

@router.get("/DiagnosticReport/{scan_id}")
async def get_fhir_report(scan_id: int, db: Session = Depends(get_db)):
    """Mock FHIR endpoint to retrieve an AI Diagnostic Report."""
    return {
        "resourceType": "DiagnosticReport",
        "id": str(scan_id),
        "status": "final",
        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0074", "code": "RAD"}]}],
        "code": {"text": "CancerGuard AI Risk Assessment"},
        "presentedForm": [{"contentType": "application/pdf", "title": "AI Prediction Report"}]
    }
