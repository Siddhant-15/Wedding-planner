from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter()

@router.post("/", response_model=ReviewOut)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    # Ensure at least one of venue_id or service_id is provided
    if not review.venue_id and not review.service_id:
        raise HTTPException(status_code=400, detail="Either venue_id or service_id must be provided")

    new_review = Review(**review.dict())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review


@router.get("/", response_model=List[ReviewOut])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).all()


@router.get("/{review_id}", response_model=ReviewOut)
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return None
