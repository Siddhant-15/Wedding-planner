from sqlalchemy import select, func
from sqlalchemy.orm import (
    selectinload,
    joinedload,
)

from app.infrastructure.db.models.models import (
    Service,
    ServiceMedia,
    ServiceVariant,
    Vendor,
)


# ─────────────────────────────────────────────────────────────────────────────
# CUSTOMER CATALOG QUERY
# ─────────────────────────────────────────────────────────────────────────────

def customer_catalog_query(
    service_type: str | None = None,
    city: str | None = None,
    skip: int = 0,
    limit: int = 20,
):
    """
    Returns ONLY published + active services.
    """

    query = (
        select(Service)
        .where(
            Service.status == "published",
            Service.is_active.is_(True),
        )
        .options(
            joinedload(Service.vendor),

            selectinload(Service.media),

            selectinload(Service.variants),

            selectinload(Service.venue),

            selectinload(Service.catering),

            selectinload(Service.dj),

            selectinload(Service.photography),

            selectinload(Service.event_management),

            selectinload(Service.makeup_artist),
        )
        .order_by(Service.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if service_type:
        query = query.where(
            Service.service_type == service_type
        )

    if city:
        query = query.where(
            Service.city.ilike(f"%{city}%")
        )

    return query


# ─────────────────────────────────────────────────────────────────────────────
# TOTAL COUNT QUERY
# ─────────────────────────────────────────────────────────────────────────────

def customer_catalog_count_query(
    service_type: str | None = None,
    city: str | None = None,
):
    query = (
        select(func.count(Service.id))
        .where(
            Service.status == "published",
            Service.is_active.is_(True),
        )
    )

    if service_type:
        query = query.where(
            Service.service_type == service_type
        )

    if city:
        query = query.where(
            Service.city.ilike(f"%{city}%")
        )

    return query


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE DETAIL QUERY
# ─────────────────────────────────────────────────────────────────────────────

def service_detail_query(service_id: int):

    return (
        select(Service)
        .where(
            Service.id == service_id,
            Service.status == "published",
            Service.is_active.is_(True),
        )
        .options(
            joinedload(Service.vendor),

            selectinload(Service.media),

            selectinload(Service.variants),

            selectinload(Service.unavailable_dates),

            selectinload(Service.venue),

            selectinload(Service.catering),

            selectinload(Service.dj),

            selectinload(Service.photography),

            selectinload(Service.event_management),

            selectinload(Service.makeup_artist),
        )
    )


# ─────────────────────────────────────────────────────────────────────────────
# MEDIA QUERY
# ─────────────────────────────────────────────────────────────────────────────

def service_media_query(service_id: int):

    return (
        select(Service)
        .where(
            Service.id == service_id,
            Service.status == "published",
            Service.is_active.is_(True),
        )
        .options(
            selectinload(Service.media)
        )
    )