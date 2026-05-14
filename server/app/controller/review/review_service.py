# ============================================================
# FILE:
# app/controller/review/review_service.py
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Review


async def create_review(
    db: AsyncSession,
    customer_id: int,
    payload
):
    review = Review(
        lead_id=payload.lead_id,
        customer_id=customer_id,
        vendor_id=payload.vendor_id,
        rating=payload.rating,
        review=payload.review
    )

    db.add(review)

    await db.commit()

    await db.refresh(review)

    return review