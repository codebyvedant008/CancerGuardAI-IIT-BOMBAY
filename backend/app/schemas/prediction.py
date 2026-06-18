from pydantic import BaseModel
from datetime import datetime

class PredictionBase(BaseModel):
    prediction_label: str  # 'Low Risk', 'Medium Risk', 'High Risk'
    confidence: float
    recommendation: str

class PredictionCreate(PredictionBase):
    scan_id: str

class PredictionOut(PredictionBase):
    id: str
    scan_id: str
    created_at: datetime

    class Config:
        from_attributes = True
