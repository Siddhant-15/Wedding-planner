from pydantic import BaseModel, EmailStr, constr
from typing import Optional
import uuid
from datetime import datetime

# -------------------------
# Request Schemas
# -------------------------

class UserSignup(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1, max_length=150)
    last_name: Optional[constr(strip_whitespace=True, max_length=150)] = None
    email: EmailStr
    password: constr(min_length=6)
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str

from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class CustomerSignup(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1, max_length=150)
    last_name: Optional[constr(strip_whitespace=True, max_length=150)] = None
    email: EmailStr
    password: constr(min_length=6)


class VendorSignup(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1, max_length=150)
    last_name: Optional[constr(strip_whitespace=True, max_length=150)] = None
    email: EmailStr
    password: constr(min_length=6)

# -------------------------
# Token Schemas
# -------------------------

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None   # user_id
    role: Optional[str] = None
    exp: Optional[int] = None

# -------------------------
# Response Schema
# -------------------------

class UserResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: Optional[str]
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True
