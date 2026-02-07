from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models.models import OrderStatus, OrderPaymentStatus
from pydantic import BaseModel, ConfigDict, Field, UUID4, condecimal

class OrderItemRead(BaseModel):
    id: UUID
    service_id: UUID
    variant_id: Optional[UUID] = None
    vendor_id: Optional[UUID] = None
    price: condecimal(max_digits=12, decimal_places=2)
    quantity: int
    total: condecimal(max_digits=12, decimal_places=2)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: UUID
    subtotal: condecimal(max_digits=12, decimal_places=2)
    tax_amount: condecimal(max_digits=12, decimal_places=2)
    platform_fee: condecimal(max_digits=12, decimal_places=2)
    total_amount: condecimal(max_digits=12, decimal_places=2)
    currency: str
    status: OrderStatus
    payment_status: OrderPaymentStatus
    invoice_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemRead] = []

    model_config = ConfigDict(from_attributes=True)


class CartItemAdd(BaseModel):
    service_id: UUID4
    variant_id: Optional[UUID4] = None
    # quantity: int = Field(1, ge=1, le=999)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=999)


class CheckoutResponse(BaseModel):
    order: OrderRead
    payment_required: bool
    payable_amount: Decimal