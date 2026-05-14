from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user

from app.schemas.reviews.review_schema import ReviewCreate

from app.controller.review.review_service import create_review

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.post("/")
async def review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await create_review(
        db,
        user["id"],
        payload
    )