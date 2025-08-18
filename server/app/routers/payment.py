# app/routes/payments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentIntentCreate, PaymentOut

router = APIRouter(prefix="/payments", tags=["Payments"])

# CREATE Payment Intent
@router.post("/", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment_intent(payload: PaymentIntentCreate, db: Session = Depends(get_db)):
    # Optional: validate booking exists and isn't already paid
    existing_payment = db.query(Payment).filter(Payment.booking_id == payload.booking_id).first()
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment for this booking already exists"
        )

    new_payment = Payment(
        booking_id=payload.booking_id,
        amount=payload.amount,
        currency=payload.currency.value,
        provider=payload.provider,
        status=PaymentStatus.PENDING
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

# GET Payment by ID
@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment

# UPDATE Payment Status
@router.patch("/{payment_id}/status", response_model=PaymentOut)
def update_payment_status(payment_id: int, status_update: PaymentStatus, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    payment.status = status_update
    if status_update == PaymentStatus.SUCCEEDED:
        from datetime import datetime
        payment.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(payment)
    return payment

# LIST All Payments (optional)
@router.get("/", response_model=List[PaymentOut])
def list_payments(db: Session = Depends(get_db)):
    return db.query(Payment).all()
