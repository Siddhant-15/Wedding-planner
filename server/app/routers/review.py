from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.database import get_db
from app.models.models import Review, User
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewOut

from app.utils.supabase_client import supabase
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import date
import json, mimetypes

logger = logging.getLogger(__name__)

Reviewrouter = APIRouter(prefix="/reviews", tags=["Reviews"])

@Reviewrouter.post("/create-customer-review", response_model=ReviewResponse)
async def create_user_review(
    service_id: str = Form(...),
    user_id: str = Form(...),

    overall_rating: int = Form(...),
    food_beverage_rating: Optional[int] = Form(None),
    service_quality_rating: Optional[int] = Form(None),
    ambiance_rating: Optional[int] = Form(None),
    value_for_money_rating: Optional[int] = Form(None),

    title: Optional[str] = Form(None),
    review_text: Optional[str] = Form(None),

    event_type: Optional[str] = Form("General"),
    event_date: Optional[str] = Form(None),   # ← changed to str

    photos: List[UploadFile] = File([]),

    db: Session = Depends(get_db),
):
    try:
        # 🔍 Check user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        # ⭐ Manual validation (Form doesn't auto-validate ranges)
        if not (1 <= overall_rating <= 5):
            raise HTTPException(status_code=400, detail="Overall rating must be between 1 and 5.")

        # ☁️ Upload images to Supabase
        photo_urls = []

        for photo in photos or []:
            file_bytes = await photo.read()

            file_ext = photo.filename.split(".")[-1] if "." in photo.filename else "bin"
            file_path = f"services/{uuid4().hex}.{file_ext}"

            content_type, _ = mimetypes.guess_type(photo.filename)
            if not content_type:
                content_type = "application/octet-stream"

            supabase.storage.from_("service-images").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )

            public_url = supabase.storage.from_("service-images").get_public_url(file_path)

            public_url_val = (
                public_url.get("publicURL")
                if isinstance(public_url, dict)
                else str(public_url)
            )

            photo_urls.append(public_url_val)

        # 🧾 Create review record
        new_review = Review(
            service_id=service_id,
            user_id=user_id,
            overall_rating=overall_rating,
            food_beverage_rating=food_beverage_rating,
            service_quality_rating=service_quality_rating,
            ambiance_rating=ambiance_rating,
            value_for_money_rating=value_for_money_rating,
            title=title,
            review_text=review_text,
            event_type=event_type,
            event_date=event_date,
            photos=photo_urls,  # JSONB column
        )

        db.add(new_review)
        db.commit()
        db.refresh(new_review)

        logger.info(f"Review created successfully by user {user_id}")
        return new_review

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Failed to create review")
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")



@Reviewrouter.get("/{service_id}", response_model=List[ReviewOut])
def get_reviews(service_id: UUID, db: Session = Depends(get_db)):
    try:
        reviews = (
            db.query(Review)
            .options(joinedload(Review.user))  # load user in same query
            .filter(Review.service_id == service_id)
            .all()
        )

        if not reviews:
            return []

        result = []

        for r in reviews:
            result.append({
                "id": r.id,
                "user": {
                    "id": r.user.id if r.user else None,
                    "name": f"{r.user.first_name} {r.user.last_name}" if r.user else "Unknown User",
                    "avatar": r.user.avatar if r.user else None,
                    "location": r.user.location if r.user else None,
                },
                "ratings": {
                    "overall": r.overall_rating,
                    "foodBeverage": r.food_beverage_rating,
                    "serviceQuality": r.service_quality_rating,
                    "ambiance": r.ambiance_rating,
                    "valueForMoney": r.value_for_money_rating,
                },
                "title": r.title,
                "text": r.review_text,
                "photos": r.photos or [],
                "eventType": r.event_type,
                "eventDate": r.event_date,
                "createdAt": r.created_at,
                "isVerified": r.user.is_verified if r.user else False,
                "helpfulCount": r.helpful_count,
                "response": None  # no table yet
            })

        return result

    except SQLAlchemyError as e:
        logger.error(f"DB error while fetching reviews: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error.")

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error.")
