# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.models.booking import Booking
# from app.schemas.booking import BookingCreate, BookingOut, BookingStatus
# from typing import List

# router = APIRouter()

# @router.post("/", response_model=BookingOut)
# def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
#     new_booking = Booking(**booking.dict())
#     db.add(new_booking)
#     db.commit()
#     db.refresh(new_booking)
#     return new_booking


# @router.get("/", response_model=List[BookingOut])
# def get_all_bookings(db: Session = Depends(get_db)):
#     return db.query(Booking).all()


# @router.get("/{booking_id}", response_model=BookingOut)
# def get_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(Booking).filter(Booking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")
#     return booking


# @router.put("/{booking_id}", response_model=BookingOut)
# def update_booking(booking_id: int, booking_data: BookingCreate, db: Session = Depends(get_db)):
#     booking = db.query(Booking).filter(Booking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     for key, value in booking_data.dict(exclude_unset=True).items():
#         setattr(booking, key, value)

#     db.commit()
#     db.refresh(booking)
#     return booking


# @router.patch("/{booking_id}/status", response_model=BookingOut)
# def update_booking_status(booking_id: int, status: BookingStatus, db: Session = Depends(get_db)):
#     booking = db.query(Booking).filter(Booking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     booking.status = status
#     db.commit()
#     db.refresh(booking)
#     return booking


# @router.delete("/{booking_id}")
# def delete_booking(booking_id: int, db: Session = Depends(get_db)):
#     booking = db.query(Booking).filter(Booking.id == booking_id).first()
#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     db.delete(booking)
#     db.commit()
#     return {"detail": "Booking deleted successfully"}
