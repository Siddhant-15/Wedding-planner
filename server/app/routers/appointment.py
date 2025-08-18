# app/routers/appointment.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.appointments import AppointmentCreate, AppointmentOut

router = APIRouter()

@router.post("/", response_model=AppointmentOut)
def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    # Check for conflicting appointments (optional)
    conflict = db.query(Appointment).filter(
        Appointment.vendor_id == data.vendor_id,
        Appointment.venue_id == data.venue_id,
        Appointment.preferred_date == data.preferred_date,
        Appointment.status != AppointmentStatus.CANCELLED
    ).first()

    if conflict:
        raise HTTPException(status_code=400, detail="Appointment slot is already taken.")

    new_appt = Appointment(**data.dict())
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt


@router.get("/", response_model=List[AppointmentOut])
def list_appointments(
    vendor_id: int = None,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if vendor_id:
        query = query.filter(Appointment.vendor_id == vendor_id)
    if user_id:
        query = query.filter(Appointment.user_id == user_id)
    return query.all()


@router.put("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    status: AppointmentStatus,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}")
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appointment.status = AppointmentStatus.CANCELLED
    db.commit()
    return {"message": "Appointment cancelled successfully."}
