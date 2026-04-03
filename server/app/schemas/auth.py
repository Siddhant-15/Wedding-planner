from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Token(BaseModel):
    access_token: str
    # refresh_token is set via cookie — not returned in body

class CustomerSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    phone: Optional[str] = None
    # add other customer fields if needed

class VendorSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    phone: Optional[str] = None
    business_name: Optional[str] = None
    contact_person: Optional[str] = None
    website: Optional[str] = None
    # add other vendor fields

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str = Field(..., pattern="^(customer|vendor)$")  # enforce at input

class ResetPasswordIn(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(customer|vendor)$")

# app/schemas/auth.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class TokenPayload(BaseModel):
    """
    Expected structure of the decoded JWT payload.
    Use this for validation in decode_token().
    """
    sub: EmailStr               # usually email (as string)
    role: str                   # "customer" or "vendor"
    exp: int                    # expiration timestamp (unix)
    iat: int                    # issued at (unix)
    type: Optional[str] = None  # "refresh" for refresh tokens (optional marker)

    class Config:
        from_attributes = True  # allow creating from dict (jwt.decode result)