from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc
from app.models.models import Service

from app.db_queries.Customer.customer_services_queries import (
    base_service_query,
    base_count_query,
    service_detail_query,
    service_media_query,
)

from app.utils.Customer.media_utils import get_preview_media, sort_media

from app.schemas.Customer.customer_services import (
    ServiceCardSchema,
    ServiceDetailResponse,
    ServiceMediaSchema,
    VenueDetailSchema,
    ServiceVariantDetailSchema,
    VendorCardSchema,
    UnavailableDateSchema,
    CateringDetailSchema,
    DjDetailSchema,
    PhotographyDetailSchema,
    EventManagementDetailSchema,
    MakeupArtistDetailSchema,
)


class CustomerServiceController:

    @staticmethod
    async def map_service_detail(db: AsyncSession, service: Service):

        return ServiceDetailResponse(
            id=str(service.id),
            name=service.service_name,
            description=service.description,

            vendor_id=str(service.vendor_id),

            vendor_name=service.vendor.business_name if service.vendor else "Unknown",

            area=service.area or "",
            city=service.city,
            state=service.state,
            add_line1=service.add_line1,
            add_line2=service.add_line2,
            country=service.country,

            latitude=float(service.latitude) if service.latitude else None,
            longitude=float(service.longitude) if service.longitude else None,

            metadata=service.metadata_ or {},   # 🔥 FIX HERE

            created_at=service.created_at,
            updated_at=service.updated_at,
            service_type=service.service_type,

            vendor=VendorCardSchema.model_validate(service.vendor),

            venue=VenueDetailSchema.model_validate(service.venue) if service.venue else None,

            variants=[
                ServiceVariantDetailSchema.model_validate(v)
                for v in (service.variants or [])
            ],

            media=[
                ServiceMediaSchema.model_validate(m)
                for m in (service.media or [])
            ],

            total_media=len(service.media or []),
            has_more_media=len(service.media or []) > 0,
        )

    @staticmethod
    async def list_services(db: AsyncSession, service_type: str, skip: int, limit: int, city: str | None):
        query = base_service_query(service_type)
        count_query = base_count_query(service_type)

        if city:
            query = query.filter(Service.city.ilike(f"%{city}%"))
            count_query = count_query.filter(Service.city.ilike(f"%{city}%"))

        query = query.order_by(desc(Service.created_at))

        total = (await db.execute(count_query)).scalar_one()

        result = await db.execute(query.offset(skip).limit(limit))
        services = result.scalars().unique().all()

        results = []

        for service in services:
            media = [
                ServiceMediaSchema(
                    media_url=m.media_url,
                    media_type=m.media_type,
                    source_type=m.source_type,
                    is_cover=m.is_cover,
                )
                for m in service.media
                if m.media_type == "image"
            ]

            results.append(
                ServiceCardSchema(
                    id=str(service.id),
                    name=service.service_name,
                    description=service.description,
                    media=media,
                    area=service.area or "",
                    city=service.city,
                    state=service.state,
                    add_line1=service.add_line1,
                    add_line2=service.add_line2,
                    country=service.country,
                    latitude=float(service.latitude) if service.latitude else None,
                    longitude=float(service.longitude) if service.longitude else None,
                    vendor_name=service.vendor.business_name or "Unknown",
                    vendor_id=str(service.vendor.id),
                    service_type=service.service_type,
                    venue=VenueDetailSchema.model_validate(service.venue) if service.venue else None,
                    variants=[ServiceVariantDetailSchema.model_validate(v) for v in service.variants],
                )
            )

        return results, total


    @staticmethod
    async def get_service_detail(db: AsyncSession, service_id: int):
        result = await db.execute(service_detail_query(service_id))
        service = result.unique().scalar_one_or_none()

        return service


    @staticmethod
    async def get_service_media(db: AsyncSession, service_id: int, skip: int, limit: int):
        result = await db.execute(service_media_query(service_id))
        service = result.unique().scalar_one_or_none()

        if not service:
            return None

        sorted_media = sort_media(service.media)
        paginated = sorted_media[skip: skip + limit]

        return {
            "media": [
                ServiceMediaSchema(
                    media_url=m.media_url,
                    media_type=m.media_type,
                    source_type=m.source_type,
                    is_cover=m.is_cover,
                )
                for m in paginated
            ],
            "total": len(sorted_media),
            "has_more": skip + limit < len(sorted_media),
        }