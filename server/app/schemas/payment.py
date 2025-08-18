from typing import Optional
from pydantic import confloat, constr
from .base import StrictModel
from .common import Currency
from enum import Enum

class PaymentStatus(str, Enum):
    REQUIRES_ACTION = "requires_action"
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentIntentCreate(StrictModel):
    booking_id: int
    amount: confloat(ge=0)
    currency: Currency = Currency.INR
    provider: constr(min_length=2, max_length=30)

class PaymentOut(StrictModel):
    id: int
    booking_id: int
    amount: float
    currency: Currency
    provider: str
    provider_reference: Optional[str]
    status: PaymentStatus
