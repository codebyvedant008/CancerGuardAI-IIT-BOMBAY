import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.scan import Scan
from app.models.prediction import Prediction
from app.services.ai_service import ai_service
from app.utils.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/predict", tags=["AI Predictions"])

# Allowed extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
DISCLAIMER = "This AI system provides risk assessment only and is not a substitute for professional medical diagnosis."

async def process_and_predict(
    cancer_type: str,
    file: UploadFile,
    current_user: User,
    db: Session
):
    """Common helper to process uploaded scan and generate prediction."""
    # 1. Validate File extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Supported: JPG, JPEG, PNG"
        )
        
    # 2. Save Image File
    unique_filename = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        with open(save_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )
        
    # 3. Create Scan Record in DB
    db_scan = Scan(
        user_id=current_user.id,
        cancer_type=cancer_type,
        image_path=unique_filename
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    # 4. Generate AI Prediction (Mock)
    try:
        prediction_result = await ai_service.predict_risk(cancer_type, save_path)
    except Exception as e:
        # Cleanup file if prediction setup fails
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Prediction engine error: {str(e)}"
        )
        
    # 5. Save Prediction Record in DB
    db_pred = Prediction(
        scan_id=db_scan.id,
        prediction_label=prediction_result["prediction"],
        confidence=prediction_result["confidence"],
        recommendation=prediction_result["recommendation"]
    )
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)
    
    # 6. Return standard structured response
    return {
        "scan_id": db_scan.id,
        "prediction_id": db_pred.id,
        "cancer_type": cancer_type,
        "prediction": db_pred.prediction_label,
        "confidence": db_pred.confidence,
        "recommendation": db_pred.recommendation,
        "image_path": db_scan.image_path,
        "created_at": db_pred.created_at,
        "disclaimer": DISCLAIMER
    }

@router.post("/skin")
async def predict_skin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and assess skin cancer risk (e.g. Melanoma)."""
    return await process_and_predict("skin_cancer", file, current_user, db)

@router.post("/brain")
async def predict_brain(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and assess brain tumor risk."""
    return await process_and_predict("brain_tumor", file, current_user, db)

@router.post("/lung")
async def predict_lung(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and assess lung cancer risk."""
    return await process_and_predict("lung_cancer", file, current_user, db)

@router.post("/breast")
async def predict_breast(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and assess breast cancer risk (e.g. Mammography)."""
    return await process_and_predict("breast_cancer", file, current_user, db)
