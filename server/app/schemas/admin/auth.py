"""
app/schemas/admin/auth.py

Pydantic schemas for admin authentication.
"""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class AdminLogin(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=6)


class AdminToken(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    role:         str
    admin_id:     int
    email:        str


class AdminPasswordChange(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password:     str = Field(..., min_length=6)

class AdminSignup(BaseModel):
    first_name: str = Field(..., min_length=2)
    last_name: str = Field(..., min_length= 2)
    email: EmailStr
    password: str = Field(..., min_length=8)