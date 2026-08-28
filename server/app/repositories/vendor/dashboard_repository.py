from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    Lead,
    LeadStatusEnum,
    Review,
    Service,
    ServiceStatusEnum,
    ServiceView,
)


class VendorDashboardRepository:

    @staticmethod
    async def get_kpis(
        db: AsyncSession,
        vendor_id: int,
    ) -> dict:

        # ---------------------------------------------------------
        # SERVICE COUNTS
        # ---------------------------------------------------------
        service_stmt = (
            select(
                func.count(Service.id).label("total_services"),
                func.count(Service.id)
                .filter(
                    Service.status == ServiceStatusEnum.live,
                    Service.deleted_at.is_(None),
                    Service.is_active.is_(True),
                )
                .label("live_services"),
            )
            .where(
                Service.vendor_id == vendor_id,
                Service.deleted_at.is_(None),
            )
        )

        service_result = await db.execute(service_stmt)
        service_data = service_result.one()

        # ---------------------------------------------------------
        # LEAD COUNTS
        # ---------------------------------------------------------
        lead_stmt = (
            select(
                func.count(Lead.id).label("total_leads"),
                func.count(Lead.id)
                .filter(Lead.status == LeadStatusEnum.new)
                .label("new_leads"),
            )
            .where(Lead.vendor_id == vendor_id)
        )

        lead_result = await db.execute(lead_stmt)
        lead_data = lead_result.one()

        # ---------------------------------------------------------
        # TOTAL SERVICE VIEWS
        # ---------------------------------------------------------
        views_stmt = (
            select(func.count(ServiceView.id))
            .join(
                Service,
                Service.id == ServiceView.service_id,
            )
            .where(
                Service.vendor_id == vendor_id,
                Service.deleted_at.is_(None),
            )
        )

        total_views = await db.scalar(views_stmt)

        # ---------------------------------------------------------
        # REVIEWS + AVERAGE RATING
        # ---------------------------------------------------------
        rating_stmt = (
            select(
                func.count(Review.id).label("total_reviews"),
                func.coalesce(
                    func.avg(Review.overall_rating),
                    Decimal("0.00"),
                ).label("average_rating"),
            )
            .join(
                Service,
                Service.id == Review.service_id,
            )
            .where(
                Service.vendor_id == vendor_id,
                Service.deleted_at.is_(None),
                Review.deleted_at.is_(None),
            )
        )

        rating_result = await db.execute(rating_stmt)
        rating_data = rating_result.one()

        return {
            "total_services": service_data.total_services or 0,
            "live_services": service_data.live_services or 0,
            "total_leads": lead_data.total_leads or 0,
            "new_leads": lead_data.new_leads or 0,
            "total_views": total_views or 0,
            "average_rating": rating_data.average_rating or Decimal("0.00"),
            "total_reviews": rating_data.total_reviews or 0,
        }