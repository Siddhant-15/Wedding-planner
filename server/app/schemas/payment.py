from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    amount: float
    payment_method: str
    status: Optional[str] = "pending"


class PaymentCreate(PaymentBase):
    appointment_id: str


class PaymentResponse(PaymentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True