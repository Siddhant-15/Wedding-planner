from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc
from app.models.models import Review, ServiceRatingSummary
# from app.models.customer import Customer   # if you have it


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, review_id: int) -> Optional[Review]:
        return (
            self.db.query(Review)
            .filter(Review.id == review_id, Review.deleted_at.is_(None))
            .first()
        )

    def list_by_service(
        self,
        service_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
        sort: str = "recent",  # recent | highest | lowest | helpful
    ) -> Tuple[List[Review], int]:
        q = (
            self.db.query(Review)
            .filter(Review.service_id == service_id, Review.deleted_at.is_(None))
        )

        if sort == "highest":
            q = q.order_by(desc(Review.overall_rating), desc(Review.created_at))
        elif sort == "lowest":
            q = q.order_by(Review.overall_rating, desc(Review.created_at))
        elif sort == "helpful":
            q = q.order_by(desc(Review.helpful_count), desc(Review.created_at))
        else:  # recent
            q = q.order_by(desc(Review.created_at))

        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return items, total

    def create(self, review: Review) -> Review:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def soft_delete(self, review: Review) -> None:
        review.deleted_at = func.now()
        self.db.commit()

    def get_rating_summary(self, service_id: int) -> Optional[ServiceRatingSummary]:
        return (
            self.db.query(ServiceRatingSummary)
            .filter(ServiceRatingSummary.service_id == service_id)
            .first()
        )

    def user_already_reviewed(self, service_id: int, user_id: int) -> bool:
        return (
            self.db.query(Review.id)
            .filter(
                Review.service_id == service_id,
                Review.user_id == user_id,
                Review.deleted_at.is_(None),
            )
            .first()
            is not None
        )