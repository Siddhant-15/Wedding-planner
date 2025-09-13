# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List
# import uuid

# from app.database import get_db
# from app.models.review import Review
# from app.schemas.review import ReviewCreate, ReviewResponse

# router = APIRouter()

# @router.post("/", response_model=ReviewResponse)
# def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
#     # Ensure at least one of venue_id or service_id is provided
#     if not review.venue_id and not review.service_id:
#         raise HTTPException(status_code=400, detail="Either venue_id or service_id must be provided")

#     new_review = Review(
#         customer_id=uuid.UUID(review.customer_id),
#         vendor_id=uuid.UUID(review.vendor_id) if review.vendor_id else None,
#         venue_id=uuid.UUID(review.venue_id) if review.venue_id else None,
#         service_id=uuid.UUID(review.service_id) if review.service_id else None,
#         rating=review.rating,
#         comment=review.comment,
#     )
#     db.add(new_review)
#     db.commit()
#     db.refresh(new_review)
#     return new_review


# @router.get("/", response_model=List[ReviewResponse])
# def list_reviews(db: Session = Depends(get_db)):
#     return db.query(Review).all()


# @router.get("/{review_id}", response_model=ReviewResponse)
# def get_review(review_id: str, db: Session = Depends(get_db)):
#     try:
#         rid = uuid.UUID(review_id)
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid review ID")
#     review = db.query(Review).filter(Review.id == rid).first()
#     if not review:
#         raise HTTPException(status_code=404, detail="Review not found")
#     return review


# @router.delete("/{review_id}", status_code=204)
# def delete_review(review_id: str, db: Session = Depends(get_db)):
#     try:
#         rid = uuid.UUID(review_id)
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid review ID")
#     review = db.query(Review).filter(Review.id == rid).first()
#     if not review:
#         raise HTTPException(status_code=404, detail="Review not found")
#     db.delete(review)
#     db.commit()
#     return None
