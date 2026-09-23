from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, File, Form, UploadFile, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user, get_current_user_optional
from app.controller.customer.review_service import ReviewService
from app.schemas.customer.review import ReviewOut, ReviewListOut, ReviewUpdate

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get(
    "/service/{service_id}",
    response_model=ReviewListOut,
    summary="List reviews for a service with rating breakdown",
)
async def get_reviews(
    service_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    sort: str = Query("recent", pattern="^(recent|highest|lowest|helpful)$"),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.get_reviews_for_service(
        service_id, skip=skip, limit=limit, sort=sort
    )


@router.get(
    "/service/{service_id}/my-review",
    response_model=Optional[ReviewOut],
    summary="Get authenticated user's review for a service",
)
async def get_my_review(
    service_id: int,
    current_user=Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        return None
    service = ReviewService(db)
    return await service.get_user_review(service_id, current_user["id"])


@router.post(
    "",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a review (multipart or form data supported)",
)
async def create_review(
    service_id: int = Form(...),
    overall_rating: int = Form(..., ge=1, le=5),
    food_beverage_rating: Optional[int] = Form(None),
    service_quality_rating: Optional[int] = Form(None),
    ambiance_rating: Optional[int] = Form(None),
    value_for_money_rating: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    review_text: Optional[str] = Form(None),
    event_type: Optional[str] = Form(None),
    event_date: Optional[date] = Form(None),
    photos: List[UploadFile] = File(default=[]),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customer accounts can submit reviews."
        )

    def clean(v):
        return None if v in (None, "", "null") else v

    service = ReviewService(db)
    return await service.create_review(
        user_id=current_user["id"],
        service_id=service_id,
        overall_rating=overall_rating,
        food_beverage_rating=clean(food_beverage_rating),
        service_quality_rating=clean(service_quality_rating),
        ambiance_rating=clean(ambiance_rating),
        value_for_money_rating=clean(value_for_money_rating),
        title=clean(title),
        review_text=clean(review_text),
        event_type=clean(event_type),
        event_date=event_date,
        photos=photos or [],
    )


@router.patch(
    "/{review_id}",
    response_model=ReviewOut,
    summary="Update own review",
)
async def update_review(
    review_id: int,
    payload: ReviewUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.update_review(
        review_id=review_id,
        user_id=current_user["id"],
        overall_rating=payload.overall_rating,
        food_beverage_rating=payload.food_beverage_rating,
        service_quality_rating=payload.service_quality_rating,
        ambiance_rating=payload.ambiance_rating,
        value_for_money_rating=payload.value_for_money_rating,
        title=payload.title,
        review_text=payload.review_text,
        event_type=payload.event_type,
        event_date=payload.event_date,
    )


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete own review",
)
async def delete_review(
    review_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    await service.soft_delete_review(review_id, current_user["id"])