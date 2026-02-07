# # app/routers/availability.py
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.models.availability import Availability
# from app.schemas.availability import BulkAvailabilityUpsertRequest, AvailabilityOut, AvailabilitySlot
# from typing import List
# from sqlalchemy.exc import IntegrityError
# import uuid
# from datetime import date

# router = APIRouter()

# @router.post("/bulk-upsert", response_model=AvailabilityOut)
# def bulk_upsert_availability(payload: BulkAvailabilityUpsertRequest, db: Session = Depends(get_db)):
#     slots_out = []

#     venue_uuid = uuid.UUID(payload.venue_id) if payload.venue_id else None
#     vendor_uuid = uuid.UUID(payload.vendor_id) if payload.vendor_id else None
#     service_uuid = uuid.UUID(payload.service_id) if payload.service_id else None

#     for slot in payload.slots:
#         availability = db.query(Availability).filter(
#             Availability.venue_id == venue_uuid,
#             Availability.available_date == slot.date,
#             Availability.available_time == slot.time
#         ).first()

#         if availability:
#             availability.is_available = slot.is_available
#         else:
#             new_avail = Availability(
#                 venue_id=venue_uuid,
#                 vendor_id=vendor_uuid,
#                 service_id=service_uuid,
#                 available_date=slot.date,
#                 available_time=slot.time,
#                 is_available=slot.is_available
#             )
#             db.add(new_avail)
#         slots_out.append(slot)

#     try:
#         db.commit()
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(status_code=400, detail="Duplicate date entry for the same venue")

#     return AvailabilityOut(venue_id=payload.venue_id, vendor_id=payload.vendor_id, service_id=payload.service_id, slots=slots_out)


# @router.get("/{venue_id}", response_model=AvailabilityOut)
# def get_venue_availability(venue_id: str, db: Session = Depends(get_db)):
#     vid = uuid.UUID(venue_id)
#     availabilities = db.query(Availability).filter(Availability.venue_id == vid).all()

#     if not availabilities:
#         raise HTTPException(status_code=404, detail="No availability found for this venue")

#     slots = [AvailabilitySlot(date=a.available_date, time=a.available_time, is_available=a.is_available) for a in availabilities]
#     return AvailabilityOut(venue_id=venue_id, slots=slots)


# @router.delete("/{venue_id}/{slot_date}")
# def delete_availability(venue_id: str, slot_date: date, db: Session = Depends(get_db)):
#     vid = uuid.UUID(venue_id)
#     availability = db.query(Availability).filter(
#         Availability.venue_id == vid,
#         Availability.available_date == slot_date
#     ).first()

#     if not availability:
#         raise HTTPException(status_code=404, detail="Slot not found")

#     db.delete(availability)
#     db.commit()
#     return {"message": "Availability slot deleted successfully"}
