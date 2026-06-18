from pydantic import BaseModel
from datetime import datetime

class ReportBase(BaseModel):
    prediction_id: str
    pdf_path: str

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
