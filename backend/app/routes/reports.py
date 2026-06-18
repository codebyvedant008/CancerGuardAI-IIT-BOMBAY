import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.report import Report
from app.services.pdf_service import PDFService
from app.utils.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/download/{prediction_id}")
def download_pdf_report(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate and return a downloadable PDF report for a prediction."""
    # 1. Fetch prediction and verify ownership
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found"
        )
        
    scan = prediction.scan
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record associated with prediction not found"
        )
        
    # Check authorization (must be scan owner or an admin)
    if scan.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this report"
        )
        
    # 2. Check if report already exists in database
    db_report = db.query(Report).filter(Report.prediction_id == prediction_id).first()
    
    filename = f"report_{prediction_id}.pdf"
    full_pdf_path = os.path.join(settings.REPORTS_DIR, filename)
    
    # 3. If PDF file doesn't exist, generate it
    if not db_report or not os.path.exists(full_pdf_path):
        # Retrieve patient information
        patient = scan.user
        patient_info = {
            "full_name": patient.full_name,
            "email": patient.email,
            "age": patient.age,
            "gender": patient.gender
        }
        
        try:
            # Generate the PDF file
            PDFService.generate_report(
                user_info=patient_info,
                scan_date=prediction.created_at,
                cancer_type=scan.cancer_type,
                prediction=prediction.prediction_label,
                confidence=prediction.confidence,
                recommendation=prediction.recommendation,
                output_filename=filename
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PDF report: {str(e)}"
            )
            
        # Write report meta to DB if not already present
        if not db_report:
            db_report = Report(
                prediction_id=prediction_id,
                pdf_path=filename
            )
            db.add(db_report)
            db.commit()
            db.refresh(db_report)

    # 4. Return the PDF file response
    return FileResponse(
        path=full_pdf_path,
        media_type="application/pdf",
        filename=f"CancerGuard_Report_{scan.cancer_type}_{prediction.prediction_label.replace(' ', '_')}.pdf"
    )
