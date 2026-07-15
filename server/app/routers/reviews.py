from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.db.db import get_db
from app.models.models import Review, Customer
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewOut

from app.utils.supabase_client import supabase
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, date
import uuid, mimetypes
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

Reviewrouter = APIRouter(prefix="/reviews", tags=["Reviews"])

@Reviewrouter.post("/create-customer-review", response_model=ReviewResponse)
async def create_user_review(
    service_id: int = Form(...),
    user_id: int = Form(...),

    overall_rating: int = Form(...),
    food_beverage_rating: Optional[int] = Form(None),
    service_quality_rating: Optional[int] = Form(None),
    ambiance_rating: Optional[int] = Form(None),
    value_for_money_rating: Optional[int] = Form(None),

    title: Optional[str] = Form(None),
    review_text: Optional[str] = Form(None),

    event_type: Optional[str] = Form("General"),
    event_date: Optional[str] = Form(None),

    photos: List[UploadFile] = File([]),

    db: Session = Depends(get_db),
):
    try:
        # Check user exists via Customer table
        result = await db.execute(
            select(Customer).filter(Customer.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        if not (1 <= overall_rating <= 5):
            raise HTTPException(status_code=400, detail="Overall rating must be between 1 and 5.")

        photo_urls = []

        for photo in photos or []:
            if not photo.filename:
                continue
            file_bytes = await photo.read()
            file_ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
            file_path = f"reviews/{uuid.uuid4().hex}.{file_ext}"

            content_type, _ = mimetypes.guess_type(photo.filename)
            if not content_type:
                content_type = "application/octet-stream"

            supabase.storage.from_("service-images").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )

            public_url = supabase.storage.from_("service-images").get_public_url(file_path)
            public_url_val = public_url.get("publicURL") if isinstance(public_url, dict) else str(public_url)
            photo_urls.append(public_url_val)

        parsed_event_date = None
        if event_date:
            try:
                parsed_event_date = datetime.strptime(event_date.split('T')[0], "%Y-%m-%d").date()
            except ValueError:
                parsed_event_date = None
                
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
            event_date=parsed_event_date,
            photos=photo_urls,
        )

        db.add(new_review)
        await db.commit()
        await db.refresh(new_review)

        logger.info(f"Review created successfully by user {user_id}")
        return new_review

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Failed to create review")
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")


@Reviewrouter.get("/{service_id}", response_model=List[ReviewOut])
async def get_reviews(service_id: int, db: Session = Depends(get_db)):
    try:
        result = await db.execute(
            select(Review)
            .options(selectinload(Review.customer))  # 🔥 better than joinedload
            .filter(Review.service_id == service_id)
        )

        reviews = result.scalars().all()

        if not reviews:
            return []

        result = []

        for r in reviews:
            # Handle location display smoothly
            location_parts = []
            if r.customer:
                if r.customer.city: location_parts.append(r.customer.city)
                if r.customer.state: location_parts.append(r.customer.state)
            
            loc = ", ".join(location_parts) if location_parts else None
            
            result.append({
                "id": r.id,
                "user": {
                    "id": r.customer.id if r.customer else 0,
                    "name": f"{r.customer.first_name} {r.customer.last_name}" if r.customer else "Unknown User",
                    "avatar": r.customer.avatar if r.customer else None,
                    "location": loc,
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
                "isVerified": r.customer.is_verified if r.customer else False,
                "helpfulCount": r.helpful_count,
                "response": None
            })

        return result

    except SQLAlchemyError as e:
        logger.error(f"DB error while fetching reviews: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error.")

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error.")
