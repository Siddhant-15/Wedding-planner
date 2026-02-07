from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=150)
    last_name: str = Field(..., min_length=1, max_length=150)
    location: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")  # E.164 format validation

class UserUpdate(UserBase):
    avatar: Optional[str] = None  # Will handle upload separately

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    avatar: Optional[str]
    location: Optional[str]
    phone: Optional[str]
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OTPResponse(BaseModel):
    message: str

class VerifyOTP(BaseModel):
    code: str = Field(..., pattern=r"^\d{6}$")