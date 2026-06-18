from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.prediction import PredictionOut

class ScanBase(BaseModel):
    cancer_type: str

class ScanCreate(ScanBase):
    user_id: str
    image_path: str

class ScanOut(ScanBase):
    id: str
    user_id: str
    image_path: str
    created_at: datetime
    prediction: Optional[PredictionOut] = None

    class Config:
        from_attributes = True
