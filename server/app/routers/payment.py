# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List
# import uuid

# from app.database import get_db
# from app.models.payment import Payment
# from app.schemas.payment import PaymentCreate, PaymentResponse
# from pydantic import BaseModel

# router = APIRouter(prefix="/payments", tags=["Payments"])


# @router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
# def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
#     new_payment = Payment(
#         appointment_id=uuid.UUID(payload.appointment_id),
#         amount=payload.amount,
#         payment_method=payload.payment_method,
#         status=payload.status or "pending",
#     )
#     db.add(new_payment)
#     db.commit()
#     db.refresh(new_payment)
#     return new_payment


# @router.get("/{payment_id}", response_model=PaymentResponse)
# def get_payment(payment_id: str, db: Session = Depends(get_db)):
#     try:
#         pid = uuid.UUID(payment_id)
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid payment ID")
#     payment = db.query(Payment).filter(Payment.id == pid).first()
#     if not payment:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
#     return payment


# class PaymentStatusUpdate(BaseModel):
#     status: str


# @router.patch("/{payment_id}/status", response_model=PaymentResponse)
# def update_payment_status(payment_id: str, status_update: PaymentStatusUpdate, db: Session = Depends(get_db)):
#     try:
#         pid = uuid.UUID(payment_id)
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid payment ID")
#     payment = db.query(Payment).filter(Payment.id == pid).first()
#     if not payment:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

#     payment.status = status_update.status
#     db.commit()
#     db.refresh(payment)
#     return payment


# @router.get("/", response_model=List[PaymentResponse])
# def list_payments(db: Session = Depends(get_db)):
#     return db.query(Payment).all()
