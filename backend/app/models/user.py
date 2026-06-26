import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum
import enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.PATIENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_links = relationship("PatientDoctorLink", foreign_keys="PatientDoctorLink.patient_id", back_populates="patient", cascade="all, delete-orphan")
    doctor_links = relationship("PatientDoctorLink", foreign_keys="PatientDoctorLink.doctor_id", back_populates="doctor", cascade="all, delete-orphan")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    specialty = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    hospital_affiliation = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="doctor_profile")

class PatientDoctorLink(Base):
    __tablename__ = "patient_doctor_links"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="active") # active, archived
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_links")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="doctor_links")
