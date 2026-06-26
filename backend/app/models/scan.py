import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    cancer_type = Column(String, nullable=False)  # e.g., 'skin', 'brain', 'lung', 'breast'
    image_path = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="scans")
    prediction = relationship("Prediction", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    clinical_review = relationship("ClinicalReview", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class ClinicalReview(Base):
    __tablename__ = "clinical_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id"), unique=True, nullable=False)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Review Data
    is_approved = Column(String, nullable=True) # "approved", "rejected", "needs_revision"
    clinical_notes = Column(String, nullable=True)
    diagnosis = Column(String, nullable=True)
    treatment_plan = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    scan = relationship("Scan", back_populates="clinical_review")
    doctor = relationship("User")
