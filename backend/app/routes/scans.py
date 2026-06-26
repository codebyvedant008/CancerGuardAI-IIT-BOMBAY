import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanOut
from app.utils.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/scans", tags=["Scans & History"])

@router.get("/history", response_model=List[ScanOut])
def get_scan_history(
    cancer_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve scan history for the current user, with optional search filters."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    
    # Filter by cancer type if provided
    if cancer_type:
        query = query.filter(Scan.cancer_type == cancer_type)
        
    # Join with predictions to filter by risk level
    if risk_level:
        from app.models.prediction import Prediction
        query = query.join(Prediction).filter(Prediction.prediction_label == risk_level)
        
    # Order by newest scans first
    scans = query.order_by(Scan.created_at.desc()).all()
    return scans

@router.get("/image/{filename}")
def get_scan_image(filename: str):
    """Serve the uploaded scan image files."""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    return FileResponse(file_path)

@router.get("/{scan_id}/insights")
async def get_scan_insights(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate detailed medical insights using Gemini."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
        
    from app.models.prediction import Prediction
    prediction = db.query(Prediction).filter(Prediction.scan_id == scan_id).first()
    
    if not prediction:
        raise HTTPException(status_code=400, detail="Prediction not found for this scan")
        
    from app.services.ai_service import ai_service
    
    insights = await ai_service.generate_insights(
        scan_id=scan.id,
        cancer_type=scan.cancer_type,
        prediction_label=prediction.prediction_label,
        confidence=prediction.confidence,
        user_name=current_user.full_name
    )
    
    return insights

@router.get("/{scan_id}", response_model=ScanOut)
def get_scan_details(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of a single scan by ID."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found"
        )
    return scan
