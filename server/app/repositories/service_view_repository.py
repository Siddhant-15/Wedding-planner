from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    Service,
    ServiceStatusEnum,
    ServiceView,
)


class ServiceViewRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_public_service(
        self,
        service_id: int,
    ) -> Optional[Service]:
        """
        Return a service only if it is publicly viewable.
        """

        result = await self.db.execute(
            select(Service).where(
                Service.id == service_id,
                Service.status == ServiceStatusEnum.live,
                Service.is_active.is_(True),
                Service.deleted_at.is_(None),
            )
        )

        return result.scalar_one_or_none()

    async def has_recent_customer_view(
        self,
        service_id: int,
        customer_id: int,
        hours: int = 24,
    ) -> bool:
        """Check whether this customer already viewed the service recently."""

        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

        result = await self.db.execute(
            select(ServiceView.id)
            .where(
                ServiceView.service_id == service_id,
                ServiceView.customer_id == customer_id,
                ServiceView.viewed_at >= cutoff,
            )
            .limit(1)
        )

        return result.scalar_one_or_none() is not None

    async def has_recent_anonymous_view(
        self,
        service_id: int,
        visitor_id: UUID,
        hours: int = 24,
    ) -> bool:
        """Check whether this anonymous visitor viewed the service recently."""

        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

        result = await self.db.execute(
            select(ServiceView.id)
            .where(
                ServiceView.service_id == service_id,
                ServiceView.visitor_id == visitor_id,
                ServiceView.viewed_at >= cutoff,
            )
            .limit(1)
        )

        return result.scalar_one_or_none() is not None

    async def create_view(
        self,
        service_id: int,
        customer_id: Optional[int] = None,
        visitor_id: Optional[UUID] = None,
    ) -> ServiceView:
        """
        Create a service view event.
        """

        if customer_id is not None:
            service_view = ServiceView(
                service_id=service_id,
                customer_id=customer_id,
                visitor_id=None,
                viewer_type="customer",
            )
        else:
            service_view = ServiceView(
                service_id=service_id,
                customer_id=None,
                visitor_id=visitor_id,
                viewer_type="anonymous",
            )

        self.db.add(service_view)
        await self.db.flush()

        return service_view

    async def get_total_views(
        self,
        service_id: int,
    ) -> int:
        """Get the total number of tracked views."""

        result = await self.db.execute(
            select(func.count(ServiceView.id)).where(
                ServiceView.service_id == service_id,
            )
        )

        return result.scalar_one()