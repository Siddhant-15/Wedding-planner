# app/routers/venue.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.venue import VenueCreate, VenueUpdate, VenueOut
from app.models.venue import Venue
from app.database import get_db
from app.core.security import get_current_user  # Auth dependency
from app.models.user import User

router = APIRouter()

# -------------------------
# CREATE VENUE
# -------------------------
@router.post("/", response_model=VenueOut, status_code=status.HTTP_201_CREATED)
def create_venue(
    venue_data: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new venue. Only authenticated vendors can create.
    """
    # You can also check if user is vendor here
    db_venue = Venue(**venue_data.dict())
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue


# -------------------------
# GET ALL VENUES
# -------------------------
@router.get("/", response_model=List[VenueOut])
def get_all_venues(db: Session = Depends(get_db)):
    """
    Retrieve all venues.
    """
    return db.query(Venue).all()


# -------------------------
# GET VENUE BY ID
# -------------------------
@router.get("/{venue_id}", response_model=VenueOut)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single venue by ID.
    """
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    return venue


# -------------------------
# UPDATE VENUE
# -------------------------
@router.put("/{venue_id}", response_model=VenueOut)
def update_venue(
    venue_id: int,
    venue_data: VenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update venue details. Only the owner can update.
    """
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")

    # Ownership check (optional)
    if venue.vendor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for field, value in venue_data.dict(exclude_unset=True).items():
        setattr(venue, field, value)

    db.commit()
    db.refresh(venue)
    return venue


# -------------------------
# DELETE VENUE
# -------------------------
@router.delete("/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venue(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a venue. Only the owner can delete.
    """
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")

    if venue.vendor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(venue)
    db.commit()
    return None
