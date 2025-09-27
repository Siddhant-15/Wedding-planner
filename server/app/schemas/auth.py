from typing import Optional
from pydantic import EmailStr, Field, constr
from .base import StrictModel
from .common import Role

Password = constr(min_length=8, max_length=128)

class SignupRequest(StrictModel):
    first_name: constr(min_length=1, max_length=50)
    last_name: constr(min_length=1, max_length=50)
    email: EmailStr
    password: Password
    role: Role = Role.CUSTOMER
    phone: Optional[constr(max_length=20)] = None

class LoginRequest(StrictModel):
    # email: EmailStr
    email: str
    password: Password
    role: Role = Role.CUSTOMER

class TokenPair(StrictModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., ge=60)

class RefreshRequest(StrictModel):
    refresh_token: str

class PasswordResetRequest(StrictModel):
    email: EmailStr

class PasswordResetConfirmRequest(StrictModel):
    token: str
    new_password: Password

class TokenPayload(StrictModel):
    sub: Optional[str] = None  # User ID or email
    role: Optional[str] = None
    exp: Optional[int] = None  # Expiration timestamp

class GoogleLoginRequest(StrictModel):
    id_token: str
    role: str
