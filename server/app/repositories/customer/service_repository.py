# app/repositories/service_repository.py
import logging
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import with_loader_criteria

from app.models.models import (
    Service, ServiceVersion, Vendor, ServiceMedia,
    ServiceVariant, Venue, CateringDetail, DjDetail,
    PhotographyDetail, EventManagementDetail, MakeupArtistDetail,
    UnavailableDate, ServiceVersionStatusEnum
)
from typing import List, Optional, Tuple

from sqlalchemy import func, select, desc

from app.models.models import (
    Service,
    ServiceVersion,
    ServiceStatusEnum,
)

logger = logging.getLogger(__name__)


class ServiceRepository:
    @staticmethod
    async def get_service_cards(
        db: AsyncSession,
        service_type: str,
        skip: int = 0,
        limit: int = 12,
        city: Optional[str] = None,
    ) -> Tuple[List[Service], int]:
        """
        Customer-facing services.
        Returns services having a published current_live_version.
        """

        query = (
            select(Service)
            .join(
                ServiceVersion,
                Service.current_live_version_id == ServiceVersion.id,
            )
            .options(
                joinedload(Service.vendor),

                joinedload(Service.current_live_version)
                .selectinload(ServiceVersion.media),

                joinedload(Service.current_live_version)
                .selectinload(ServiceVersion.variants),

                joinedload(Service.current_live_version)
                .joinedload(ServiceVersion.venue_detail),

                with_loader_criteria(
                    ServiceMedia,
                    ServiceMedia.is_cover == True,
                    include_aliases=True,
                ),
            )
            .where(
                Service.service_type == service_type,
                Service.current_live_version_id.isnot(None),
                ServiceVersion.status == ServiceVersionStatusEnum.published,
            )
        )

        count_query = (
            select(func.count(Service.id))
            .join(
                ServiceVersion,
                Service.current_live_version_id == ServiceVersion.id,
            )
            .where(
                Service.service_type == service_type,
                Service.current_live_version_id.isnot(None),
                ServiceVersion.status == ServiceVersionStatusEnum.published,
            )
        )

        if city:
            query = query.where(
                ServiceVersion.city.ilike(f"%{city}%")
            )

            count_query = count_query.where(
                ServiceVersion.city.ilike(f"%{city}%")
            )

        query = query.order_by(desc(Service.created_at))

        count_result = await db.execute(count_query)
        total = count_result.scalar_one()

        result = await db.execute(
            query.offset(skip).limit(limit)
        )

        services = result.scalars().unique().all()

        return services, total
    
    @staticmethod
    async def get_service_detail(db, service_id: int):

        query = (
            select(Service)
            .options(
                joinedload(Service.vendor),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.media),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.variants),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.venue_detail),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.catering_detail),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.dj_detail),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.photography_detail),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.event_management_detail),

                joinedload(Service.current_live_version)
                    .joinedload(ServiceVersion.makeup_artist_detail),
            )
            .where(
                Service.id == service_id,
                Service.deleted_at.is_(None),
                Service.current_live_version_id.is_not(None),
            )
        )

        result = await db.execute(query)

        rows = result.unique().scalars().all()


        if rows:
            service = rows[0]
            return service

        return None