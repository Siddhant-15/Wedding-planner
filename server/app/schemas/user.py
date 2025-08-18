from typing import Optional
from pydantic import EmailStr, constr
from .base import StrictModel
from .common import Role

class UserOut(StrictModel):
    id: int
    first_name: constr(min_length=1, max_length=50)
    last_name: constr(min_length=1, max_length=50)
    email: EmailStr
    phone: Optional[constr(max_length=20)] = None
    role: Role
    is_active: bool
    is_verified: bool

class UserUpdate(StrictModel):
    first_name: Optional[constr(min_length=1, max_length=50)] = None
    last_name: Optional[constr(min_length=1, max_length=50)] = None
    phone: Optional[constr(max_length=20)] = None
