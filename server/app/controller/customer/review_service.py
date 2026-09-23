import logging
import uuid
import mimetypes
from typing import List, Optional
from datetime import date
from decimal import Decimal
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload

from app.models.models import Review, Service, Customer, ServiceRatingSummary
from app.schemas.customer.review import ReviewOut, ReviewUserOut, ReviewListOut
from app.utils.supabase_client import supabase

logger = logging.getLogger(__name__)


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _update_service_rating_summary(self, service_id: int):
        """Recalculate and update ServiceRatingSummary for a given service."""
        result = await self.db.execute(
            select(Review).where(
                Review.service_id == service_id,
                Review.deleted_at.is_(None)
            )
        )
        reviews = result.scalars().all()

        total_reviews = len(reviews)
        breakdown = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        sum_ratings = 0

        for r in reviews:
            r_val = int(r.overall_rating)
            if 1 <= r_val <= 5:
                breakdown[str(r_val)] += 1
                sum_ratings += r_val

        avg_rating = round(Decimal(sum_ratings) / Decimal(total_reviews), 2) if total_reviews > 0 else Decimal("0.00")

        summary_res = await self.db.execute(
            select(ServiceRatingSummary).where(ServiceRatingSummary.service_id == service_id)
        )
        summary = summary_res.scalar_one_or_none()

        if summary:
            summary.average_rating = avg_rating
            summary.total_reviews = total_reviews
            summary.rating_breakdown = breakdown
        else:
            summary = ServiceRatingSummary(
                service_id=service_id,
                average_rating=avg_rating,
                total_reviews=total_reviews,
                rating_breakdown=breakdown,
            )
            self.db.add(summary)

        await self.db.commit()

    async def user_already_reviewed(self, service_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            select(Review.id).where(
                Review.service_id == service_id,
                Review.user_id == user_id,
                Review.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_user_review(self, service_id: int, user_id: int) -> Optional[ReviewOut]:
        result = await self.db.execute(
            select(Review)
            .options(selectinload(Review.customer))
            .where(
                Review.service_id == service_id,
                Review.user_id == user_id,
                Review.deleted_at.is_(None)
            )
        )
        r = result.scalar_one_or_none()
        if not r:
            return None
        return self._format_review(r)

    def _format_review(self, r: Review) -> ReviewOut:
        user_info = None
        if r.customer:
            loc_parts = [p for p in [r.customer.city, r.customer.state] if p]
            user_info = ReviewUserOut(
                id=r.customer.id,
                name=f"{r.customer.first_name} {r.customer.last_name}".strip(),
                avatar=r.customer.avatar,
                location=", ".join(loc_parts) if loc_parts else None,
                is_verified=r.customer.is_verified or False,
            )

        return ReviewOut(
            id=r.id,
            service_id=r.service_id,
            user_id=r.user_id,
            overall_rating=r.overall_rating,
            food_beverage_rating=r.food_beverage_rating,
            service_quality_rating=r.service_quality_rating,
            ambiance_rating=r.ambiance_rating,
            value_for_money_rating=r.value_for_money_rating,
            title=r.title,
            review_text=r.review_text,
            text=r.review_text,
            event_type=r.event_type,
            event_date=r.event_date,
            photos=r.photos or [],
            helpful_count=r.helpful_count or 0,
            created_at=r.created_at,
            updated_at=r.updated_at,
            is_verified=r.customer.is_verified if r.customer else False,
            ratings={
                "overall": r.overall_rating,
                "foodBeverage": r.food_beverage_rating,
                "serviceQuality": r.service_quality_rating,
                "ambiance": r.ambiance_rating,
                "valueForMoney": r.value_for_money_rating,
            },
            user=user_info,
        )

    async def get_reviews_for_service(
        self,
        service_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
        sort: str = "recent",
    ) -> ReviewListOut:
        # Check service existence
        srv_res = await self.db.execute(select(Service).where(Service.id == service_id))
        srv = srv_res.scalar_one_or_none()
        if not srv:
            raise HTTPException(status_code=404, detail="Service not found")

        q = (
            select(Review)
            .options(selectinload(Review.customer))
            .where(
                Review.service_id == service_id,
                Review.deleted_at.is_(None)
            )
        )

        if sort == "highest":
            q = q.order_by(desc(Review.overall_rating), desc(Review.created_at))
        elif sort == "lowest":
            q = q.order_by(Review.overall_rating, desc(Review.created_at))
        elif sort == "helpful":
            q = q.order_by(desc(Review.helpful_count), desc(Review.created_at))
        else:
            q = q.order_by(desc(Review.created_at))

        count_res = await self.db.execute(
            select(func.count(Review.id)).where(
                Review.service_id == service_id,
                Review.deleted_at.is_(None)
            )
        )
        total = count_res.scalar_one() or 0

        res = await self.db.execute(q.offset(skip).limit(limit))
        reviews = res.scalars().all()

        summary_res = await self.db.execute(
            select(ServiceRatingSummary).where(ServiceRatingSummary.service_id == service_id)
        )
        summary = summary_res.scalar_one_or_none()

        formatted_reviews = [self._format_review(r) for r in reviews]

        breakdown = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        if summary and summary.rating_breakdown:
            breakdown = {str(k): int(v) for k, v in summary.rating_breakdown.items()}

        avg = float(summary.average_rating) if summary else 0.0
        tot = summary.total_reviews if summary else total

        return ReviewListOut(
            reviews=formatted_reviews,
            total=total,
            average_rating=avg,
            total_reviews=tot,
            rating_breakdown=breakdown,
        )

    async def create_review(
        self,
        *,
        user_id: int,
        service_id: int,
        overall_rating: int,
        food_beverage_rating: Optional[int] = None,
        service_quality_rating: Optional[int] = None,
        ambiance_rating: Optional[int] = None,
        value_for_money_rating: Optional[int] = None,
        title: Optional[str] = None,
        review_text: Optional[str] = None,
        event_type: Optional[str] = None,
        event_date: Optional[date] = None,
        photos: List[UploadFile] = None,
    ) -> ReviewOut:
        # Validate service exists and is active
        srv_res = await self.db.execute(
            select(Service).where(Service.id == service_id, Service.deleted_at.is_(None))
        )
        service = srv_res.scalar_one_or_none()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found or unavailable")

        # Prevent duplicate review
        if await self.user_already_reviewed(service_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already reviewed this service."
            )

        photo_urls: List[str] = []
        if photos:
            for photo in photos:
                if not photo.filename:
                    continue
                try:
                    file_bytes = await photo.read()
                    ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
                    file_path = f"reviews/{uuid.uuid4().hex}.{ext}"
                    content_type, _ = mimetypes.guess_type(photo.filename)

                    supabase.storage.from_("service-images").upload(
                        path=file_path,
                        file=file_bytes,
                        file_options={"content-type": content_type or "image/jpeg"}
                    )
                    pub_res = supabase.storage.from_("service-images").get_public_url(file_path)
                    url = pub_res.get("publicURL") if isinstance(pub_res, dict) else str(pub_res)
                    photo_urls.append(url)
                except Exception as e:
                    logger.warning(f"Failed to upload review photo: {str(e)}")

        review = Review(
            service_id=service_id,
            user_id=user_id,
            overall_rating=overall_rating,
            food_beverage_rating=food_beverage_rating,
            service_quality_rating=service_quality_rating,
            ambiance_rating=ambiance_rating,
            value_for_money_rating=value_for_money_rating,
            title=title.strip() if title else None,
            review_text=review_text.strip() if review_text else None,
            event_type=event_type or "General",
            event_date=event_date,
            photos=photo_urls,
        )

        self.db.add(review)
        await self.db.commit()
        await self.db.refresh(review)

        # Recalculate rating summary
        await self._update_service_rating_summary(service_id)

        # Load customer details for response
        res = await self.db.execute(
            select(Review).options(selectinload(Review.customer)).where(Review.id == review.id)
        )
        created = res.scalar_one()

        return self._format_review(created)

    async def update_review(
        self,
        review_id: int,
        user_id: int,
        *,
        overall_rating: Optional[int] = None,
        food_beverage_rating: Optional[int] = None,
        service_quality_rating: Optional[int] = None,
        ambiance_rating: Optional[int] = None,
        value_for_money_rating: Optional[int] = None,
        title: Optional[str] = None,
        review_text: Optional[str] = None,
        event_type: Optional[str] = None,
        event_date: Optional[date] = None,
    ) -> ReviewOut:
        res = await self.db.execute(
            select(Review)
            .options(selectinload(Review.customer))
            .where(Review.id == review_id, Review.deleted_at.is_(None))
        )
        review = res.scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review.user_id != user_id:
            raise HTTPException(status_code=403, detail="You can only edit your own review")

        if overall_rating is not None:
            review.overall_rating = overall_rating
        if food_beverage_rating is not None:
            review.food_beverage_rating = food_beverage_rating
        if service_quality_rating is not None:
            review.service_quality_rating = service_quality_rating
        if ambiance_rating is not None:
            review.ambiance_rating = ambiance_rating
        if value_for_money_rating is not None:
            review.value_for_money_rating = value_for_money_rating
        if title is not None:
            review.title = title.strip() if title else None
        if review_text is not None:
            review.review_text = review_text.strip() if review_text else None
        if event_type is not None:
            review.event_type = event_type
        if event_date is not None:
            review.event_date = event_date

        await self.db.commit()
        await self.db.refresh(review)

        await self._update_service_rating_summary(review.service_id)

        return self._format_review(review)

    async def soft_delete_review(self, review_id: int, user_id: int) -> None:
        res = await self.db.execute(
            select(Review).where(Review.id == review_id, Review.deleted_at.is_(None))
        )
        review = res.scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review.user_id != user_id:
            raise HTTPException(status_code=403, detail="You can only delete your own review")

        review.deleted_at = func.now()
        await self.db.commit()

        await self._update_service_rating_summary(review.service_id)