# app/routers/availability.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.availability import Availability
from app.schemas.availability import BulkAvailabilityUpsertRequest, AvailabilityOut, AvailabilitySlot
from typing import List
from sqlalchemy.exc import IntegrityError
from datetime import date

router = APIRouter()

@router.post("/bulk-upsert", response_model=AvailabilityOut)
def bulk_upsert_availability(payload: BulkAvailabilityUpsertRequest, db: Session = Depends(get_db)):
    slots_out = []

    for slot in payload.slots:
        availability = db.query(Availability).filter(
            Availability.venue_id == payload.venue_id,
            Availability.date == slot.date
        ).first()

        if availability:
            # Update existing
            availability.is_available = slot.is_available
        else:
            # Insert new
            new_avail = Availability(
                venue_id=payload.venue_id,
                date=slot.date,
                is_available=slot.is_available
            )
            db.add(new_avail)
        slots_out.append(slot)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Duplicate date entry for the same venue")

    return AvailabilityOut(venue_id=payload.venue_id, slots=slots_out)


@router.get("/{venue_id}", response_model=AvailabilityOut)
def get_venue_availability(venue_id: int, db: Session = Depends(get_db)):
    availabilities = db.query(Availability).filter(Availability.venue_id == venue_id).all()

    if not availabilities:
        raise HTTPException(status_code=404, detail="No availability found for this venue")

    slots = [AvailabilitySlot(date=a.date, is_available=a.is_available) for a in availabilities]
    return AvailabilityOut(venue_id=venue_id, slots=slots)


@router.delete("/{venue_id}/{slot_date}")
def delete_availability(venue_id: int, slot_date: date, db: Session = Depends(get_db)):
    availability = db.query(Availability).filter(
        Availability.venue_id == venue_id,
        Availability.date == slot_date
    ).first()

    if not availability:
        raise HTTPException(status_code=404, detail="Slot not found")

    db.delete(availability)
    db.commit()
    return {"message": "Availability slot deleted successfully"}
