# repositories/service_repo.py
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from app.infrastructure.db.models.service import Service
from app.infrastructure.db.models.service_version import ServiceVersion


def customer_catalog_query(
    service_type: str | None = None,
    city: str | None = None,
    page: int = 1,
    page_size: int = 20,
):
    """Always returns only published services via their current_published_version_id."""
    q = (
        select(Service)
        .where(
            Service.status == "published",
            Service.current_published_version_id.is_not(None),
            Service.is_active == True,
        )
        .options(
            selectinload(Service.media),
            selectinload(Service.variants),
        )
        .order_by(Service.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    if service_type:
        q = q.where(Service.service_type == service_type)
    if city:
        q = q.where(Service.city.ilike(f"%{city}%"))

    return q