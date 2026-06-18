import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    prediction_label = Column(String, nullable=False)  # e.g., 'Low Risk', 'Medium Risk', 'High Risk'
    confidence = Column(Float, nullable=False)
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scan = relationship("Scan", back_populates="prediction")
    report = relationship("Report", back_populates="prediction", uselist=False, cascade="all, delete-orphan")
