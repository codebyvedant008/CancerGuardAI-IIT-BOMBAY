from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class DoctorCreate(UserBase):
    password: str = Field(..., min_length=6)
    specialty: str
    license_number: str
    hospital_affiliation: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class UserOut(UserBase):
    id: str
    is_active: bool
    is_admin: bool
    role: str
    created_at: datetime
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True

class DoctorOut(UserOut):
    role: str
    specialty: str
    hospital_affiliation: Optional[str] = None

# Admin Schemas
class AdminBase(BaseModel):
    email: EmailStr
    full_name: str

class AdminCreate(AdminBase):
    password: str = Field(..., min_length=6)

class AdminOut(AdminBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
