from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database.connection import get_db
from app.models.user import User, DoctorProfile, UserRole
from app.schemas.user import UserCreate, UserOut, UserUpdate, Token, DoctorCreate, DoctorOut
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.utils.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user in the system."""
    # Check if user already exists
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        age=user_in.age,
        gender=user_in.gender,
        is_admin=False  # default non-admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/register/doctor", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def register_doctor(doctor_in: DoctorCreate, db: Session = Depends(get_db)):
    """Register a new doctor in the system with full transactional safety."""
    # Pre-validate: check email uniqueness
    if db.query(User).filter(User.email == doctor_in.email).first():
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    
    # Pre-validate: check license number uniqueness
    if db.query(DoctorProfile).filter(DoctorProfile.license_number == doctor_in.license_number).first():
        raise HTTPException(status_code=400, detail="This medical license number is already registered.")
    
    hashed_password = get_password_hash(doctor_in.password)
    
    try:
        # Create Base User
        db_user = User(
            email=doctor_in.email,
            hashed_password=hashed_password,
            full_name=doctor_in.full_name,
            age=doctor_in.age,
            gender=doctor_in.gender,
            is_admin=False,
            role=UserRole.DOCTOR
        )
        db.add(db_user)
        db.flush()  # Write to session but don't commit yet — gets us the user ID

        # Create Doctor Profile in the same transaction
        db_doctor = DoctorProfile(
            user_id=db_user.id,
            specialty=doctor_in.specialty,
            license_number=doctor_in.license_number,
            hospital_affiliation=doctor_in.hospital_affiliation
        )
        db.add(db_doctor)
        db.commit()  # Only commit once both rows are ready
        db.refresh(db_user)
        db.refresh(db_doctor)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed. Please try again. ({str(e)})")
    
    # Construct response
    return {
        **db_user.__dict__,
        "specialty": db_doctor.specialty,
        "hospital_affiliation": db_doctor.hospital_affiliation
    }

@router.post("/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate a user and return a JWT token."""
    # Search for user in database
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated."
        )
        
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Retrieve details of the currently authenticated user."""
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information (Name, Age, Gender, and optional Password)."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.age is not None:
        current_user.age = user_update.age
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Mock forgot password endpoint."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="If this email is registered, you will receive a reset link."
        )
    return {"message": "If this email is registered, you will receive a reset link."}
