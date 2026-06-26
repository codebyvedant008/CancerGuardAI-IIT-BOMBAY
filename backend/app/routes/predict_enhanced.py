"""
Enhanced prediction routes supporting 15+ cancer types with unified endpoints.
"""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.connection import get_db
from app.models.user import User
from app.models.scan import Scan
from app.models.prediction import Prediction
from app.services.ai_service import ai_service, CancerType, CANCER_DESCRIPTIONS
from app.utils.dependencies import get_current_user
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predict", tags=["AI Predictions"])

# Allowed extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MEDICAL_DISCLAIMER = "This AI system provides risk assessment only and is not a substitute for professional medical diagnosis. All findings must be reviewed by a qualified healthcare professional."

async def process_and_predict(
    cancer_type: str,
    file: UploadFile,
    current_user: User,
    db: Session,
    language: str = "en"
):
    """
    Common helper to process uploaded scan and generate prediction.
    Validates cancer type, saves image, creates scan record, and generates AI prediction.
    """
    # 1. Validate cancer type
    valid_types = [ct.value for ct in CancerType]
    if cancer_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid cancer type. Supported types: {', '.join(valid_types)}"
        )
    
    # 2. Validate File extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Supported: JPG, JPEG, PNG"
        )
        
    # 3. Save Image File
    unique_filename = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(save_path, "wb") as buffer:
            content = await file.read()
            if not content:
                raise ValueError("Empty file uploaded")
            buffer.write(content)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )
        
    # 4. Create Scan Record in DB
    try:
        db_scan = Scan(
            user_id=current_user.id,
            cancer_type=cancer_type.lower(),
            image_path=unique_filename
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
    except Exception as e:
        logger.error(f"Failed to create scan record: {e}")
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    
    # 5. Generate AI Prediction
    try:
        prediction_result = await ai_service.predict_risk(cancer_type.lower(), save_path, language)
    except Exception as e:
        logger.error(f"AI Prediction error for {cancer_type}: {e}")
        if os.path.exists(save_path):
            os.remove(save_path)
        db.delete(db_scan)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Prediction engine error: {str(e)}"
        )
        
    # 6. Save Prediction Record in DB
    try:
        db_pred = Prediction(
            scan_id=db_scan.id,
            prediction_label=prediction_result["prediction"],
            confidence=prediction_result["confidence"],
            recommendation=prediction_result["recommendation"]
        )
        db.add(db_pred)
        db.commit()
        db.refresh(db_pred)
    except Exception as e:
        logger.error(f"Failed to save prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save prediction: {str(e)}"
        )
    
    # 7. Get cancer info
    cancer_info = ai_service.get_cancer_info(cancer_type)
    
    # 8. Return structured response
    return {
        "scan_id": db_scan.id,
        "prediction_id": db_pred.id,
        "cancer_type": cancer_type.lower(),
        "cancer_name": cancer_info.get("name", cancer_type),
        "prediction": db_pred.prediction_label,
        "confidence": db_pred.confidence,
        "recommendation": db_pred.recommendation,
        "imaging_modality": cancer_info.get("imaging", "N/A"),
        "image_path": db_scan.image_path,
        "created_at": db_pred.created_at,
        "disclaimer": MEDICAL_DISCLAIMER
    }

@router.get("/cancer-types", summary="Get all supported cancer types")
async def get_supported_cancer_types(current_user: User = Depends(get_current_user)):
    """
    Get a comprehensive list of all supported cancer types with metadata.
    """
    return {
        "total": len(CancerType),
        "cancer_types": ai_service.get_all_cancer_types()
    }

@router.post("/unified/{cancer_type}", summary="Unified prediction endpoint")
async def predict_unified(
    cancer_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    language: str = Query("en", description="Language code for the AI response")
):
    """
    Unified endpoint for cancer risk prediction.
    Accepts any supported cancer type in the path.
    """
    return await process_and_predict(cancer_type, file, current_user, db, language)

# Individual endpoints for backwards compatibility
@router.post("/skin", summary="Skin Cancer Detection")
async def predict_skin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess skin cancer and melanoma risk from dermoscopic images."""
    return await process_and_predict("skin", file, current_user, db)

@router.post("/brain", summary="Brain Tumor Detection")
async def predict_brain(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess brain tumor risk from MRI scans."""
    return await process_and_predict("brain", file, current_user, db)

@router.post("/lung", summary="Lung Cancer Detection")
async def predict_lung(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess lung cancer risk from chest X-ray or CT scans."""
    return await process_and_predict("lung", file, current_user, db)

@router.post("/breast", summary="Breast Cancer Detection")
async def predict_breast(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess breast cancer risk from digital mammograms."""
    return await process_and_predict("breast", file, current_user, db)

@router.post("/colorectal", summary="Colorectal Cancer Detection")
async def predict_colorectal(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess colorectal cancer risk from endoscopy images."""
    return await process_and_predict("colorectal", file, current_user, db)

@router.post("/ovarian", summary="Ovarian Cancer Detection")
async def predict_ovarian(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess ovarian cancer risk from ultrasound or CT scans."""
    return await process_and_predict("ovarian", file, current_user, db)

@router.post("/prostate", summary="Prostate Cancer Detection")
async def predict_prostate(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess prostate cancer risk from MRI or biopsy imaging."""
    return await process_and_predict("prostate", file, current_user, db)

@router.post("/thyroid", summary="Thyroid Cancer Detection")
async def predict_thyroid(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess thyroid cancer risk from ultrasound images."""
    return await process_and_predict("thyroid", file, current_user, db)

@router.post("/pancreatic", summary="Pancreatic Cancer Detection")
async def predict_pancreatic(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess pancreatic cancer risk from CT or MRI scans."""
    return await process_and_predict("pancreatic", file, current_user, db)

@router.post("/liver", summary="Liver Cancer Detection")
async def predict_liver(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess hepatocellular carcinoma risk from CT or MRI scans."""
    return await process_and_predict("liver", file, current_user, db)

@router.post("/leukemia", summary="Leukemia Detection")
async def predict_leukemia(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess leukemia risk from blood smear or bone marrow images."""
    return await process_and_predict("leukemia", file, current_user, db)

@router.post("/lymphoma", summary="Lymphoma Detection")
async def predict_lymphoma(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess lymphoma risk from CT or PET scans."""
    return await process_and_predict("lymphoma", file, current_user, db)

@router.post("/cervical", summary="Cervical Cancer Detection")
async def predict_cervical(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess cervical cancer risk from pap smear or colposcopy images."""
    return await process_and_predict("cervical", file, current_user, db)

@router.post("/esophageal", summary="Esophageal Cancer Detection")
async def predict_esophageal(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess esophageal cancer risk from endoscopy or CT scans."""
    return await process_and_predict("esophageal", file, current_user, db)

@router.post("/stomach", summary="Stomach Cancer Detection")
async def predict_stomach(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess gastric cancer risk from endoscopy or CT scans."""
    return await process_and_predict("stomach", file, current_user, db)

@router.post("/melanoma", summary="Melanoma Detection")
async def predict_melanoma(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Specialized melanoma detection from dermoscopic images."""
    return await process_and_predict("melanoma", file, current_user, db)

@router.get("/history", summary="Get prediction history")
async def get_prediction_history(
    cancer_type: str = Query(None, description="Filter by cancer type"),
    limit: int = Query(50, ge=1, le=500, description="Maximum results to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the prediction history for the current user.
    Can optionally filter by cancer type.
    """
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    
    if cancer_type:
        query = query.filter(Scan.cancer_type == cancer_type.lower())
    
    scans = query.order_by(desc(Scan.created_at)).limit(limit).all()
    
    result = []
    for scan in scans:
        if scan.prediction:
            result.append({
                "scan_id": scan.id,
                "prediction_id": scan.prediction.id,
                "cancer_type": scan.cancer_type,
                "prediction": scan.prediction.prediction_label,
                "confidence": scan.prediction.confidence,
                "created_at": scan.prediction.created_at,
                "cancer_info": ai_service.get_cancer_info(scan.cancer_type)
            })
    
    return {
        "total": len(result),
        "history": result
    }

@router.get("/stats", summary="Get prediction statistics")
async def get_prediction_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get prediction statistics for the current user."""
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
    
    total_scans = len(scans)
    cancer_type_counts = {}
    risk_distribution = {"Low Risk": 0, "Medium Risk": 0, "High Risk": 0}
    
    for scan in scans:
        # Count by cancer type
        cancer_type_counts[scan.cancer_type] = cancer_type_counts.get(scan.cancer_type, 0) + 1
        
        # Count by risk level
        if scan.prediction:
            risk = scan.prediction.prediction_label
            if risk in risk_distribution:
                risk_distribution[risk] += 1
    
    return {
        "total_scans": total_scans,
        "cancer_type_counts": cancer_type_counts,
        "risk_distribution": risk_distribution,
        "average_confidence": sum(s.prediction.confidence for s in scans if s.prediction) / total_scans if total_scans > 0 else 0
    }
