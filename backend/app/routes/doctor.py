from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.connection import get_db
from app.models.user import User, PatientDoctorLink, UserRole
from app.models.scan import Scan, ClinicalReview
from app.utils.dependencies import get_current_user, require_doctor_role

router = APIRouter(prefix="/doctor", tags=["Doctor Portal"])

# ─── Pydantic Schemas ───────────────────────────────────────────────────────

class ClinicalReviewCreate(BaseModel):
    is_approved: str  # "approved", "rejected", "needs_revision"
    clinical_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None

class ClinicalReviewOut(BaseModel):
    id: str
    scan_id: str
    doctor_id: str
    is_approved: Optional[str]
    clinical_notes: Optional[str]
    diagnosis: Optional[str]
    treatment_plan: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/patients")
def get_my_patients(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor_role)
):
    """Returns all patients linked to the currently authenticated doctor."""
    links = db.query(PatientDoctorLink).filter(
        PatientDoctorLink.doctor_id == current_doctor.id,
        PatientDoctorLink.status == "active"
    ).options(joinedload(PatientDoctorLink.patient)).all()
    
    patients = []
    for link in links:
        p = link.patient
        patients.append({
            "id": p.id,
            "full_name": p.full_name,
            "email": p.email,
            "age": p.age,
            "gender": p.gender,
            "created_at": p.created_at,
            "scan_count": len(p.scans)
        })
    return patients

@router.get("/pending-scans")
def get_pending_scans(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor_role)
):
    """Returns all AI-analyzed scans that have not yet been reviewed by a doctor."""
    # Get all patients linked to this doctor
    patient_ids = [
        link.patient_id for link in db.query(PatientDoctorLink).filter(
            PatientDoctorLink.doctor_id == current_doctor.id
        ).all()
    ]

    if not patient_ids:
        return []

    # Get scans that have a prediction but no clinical review yet
    reviewed_scan_ids = [r.scan_id for r in db.query(ClinicalReview).all()]
    
    scans = db.query(Scan).filter(
        Scan.user_id.in_(patient_ids),
        Scan.id.notin_(reviewed_scan_ids)
    ).options(joinedload(Scan.prediction), joinedload(Scan.user)).all()
    
    result = []
    for scan in scans:
        if scan.prediction:  # Only return scans with an AI result
            result.append({
                "scan_id": scan.id,
                "patient_name": scan.user.full_name,
                "cancer_type": scan.cancer_type,
                "prediction_label": scan.prediction.prediction_label,
                "confidence": scan.prediction.confidence,
                "created_at": scan.created_at,
            })
    return result

@router.post("/review/{scan_id}", response_model=ClinicalReviewOut)
def create_or_update_review(
    scan_id: str,
    review_data: ClinicalReviewCreate,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor_role)
):
    """Create or update a clinical review for a scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    existing = db.query(ClinicalReview).filter(ClinicalReview.scan_id == scan_id).first()
    
    if existing:
        existing.is_approved = review_data.is_approved
        existing.clinical_notes = review_data.clinical_notes
        existing.diagnosis = review_data.diagnosis
        existing.treatment_plan = review_data.treatment_plan
        db.commit()
        db.refresh(existing)
        return existing
    else:
        review = ClinicalReview(
            scan_id=scan_id,
            doctor_id=current_doctor.id,
            is_approved=review_data.is_approved,
            clinical_notes=review_data.clinical_notes,
            diagnosis=review_data.diagnosis,
            treatment_plan=review_data.treatment_plan
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

@router.get("/review/{scan_id}", response_model=ClinicalReviewOut)
def get_review(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the clinical review for a scan (accessible by both patients and doctors)."""
    review = db.query(ClinicalReview).filter(ClinicalReview.scan_id == scan_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="No clinical review found for this scan.")
    return review

@router.post("/assign-patient")
def assign_patient(
    patient_email: str,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor_role)
):
    """Assign a patient to this doctor by their email."""
    patient = db.query(User).filter(
        User.email == patient_email,
        User.role == UserRole.PATIENT
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    # Check if already linked
    existing = db.query(PatientDoctorLink).filter(
        PatientDoctorLink.doctor_id == current_doctor.id,
        PatientDoctorLink.patient_id == patient.id
    ).first()
    
    if existing:
        existing.status = "active"
        db.commit()
        return {"message": f"Patient {patient.full_name} re-activated successfully."}
    
    link = PatientDoctorLink(
        doctor_id=current_doctor.id,
        patient_id=patient.id,
        status="active"
    )
    db.add(link)
    db.commit()
    return {"message": f"Patient {patient.full_name} assigned successfully."}

@router.get("/stats")
def get_doctor_stats(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor_role)
):
    """Returns key statistics for the doctor's dashboard."""
    patient_ids = [
        link.patient_id for link in db.query(PatientDoctorLink).filter(
            PatientDoctorLink.doctor_id == current_doctor.id
        ).all()
    ]
    
    total_patients = len(patient_ids)
    total_scans = db.query(Scan).filter(Scan.user_id.in_(patient_ids)).count() if patient_ids else 0
    reviewed = db.query(ClinicalReview).filter(ClinicalReview.doctor_id == current_doctor.id).count()
    pending = total_scans - reviewed

    return {
        "total_patients": total_patients,
        "total_scans": total_scans,
        "reviewed": reviewed,
        "pending_reviews": max(0, pending)
    }
