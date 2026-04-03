from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=150)
    last_name: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    business_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    avatar: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    business_name: Optional[str] = None  # Vendor only
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True