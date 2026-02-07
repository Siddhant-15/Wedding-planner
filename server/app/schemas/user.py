from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ----------------- USERS -----------------
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
