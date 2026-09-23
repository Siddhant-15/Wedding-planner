import logging
from typing import Optional, Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from app.models.models import Service, ServiceVersion, Wishlist, Favorite, ServiceRatingSummary
from app.schemas.wishlist import Priority

logger = logging.getLogger(__name__)

PRIORITY_TO_INT = {
    "low": 0,
    "medium": 1,
    "high": 2,
}


def map_priority(p: Optional[int]) -> str:
    return {0: "low", 1: "medium", 2: "high"}.get(p or 0, "low")


def extract_pricing(service: Service) -> Dict[str, Any]:
    version = getattr(service, "current_live_version", None)
    variants = (getattr(version, "variants", None) if version else None) or getattr(service, "variants", None) or []

    for variant in variants:
        pricing = getattr(variant, "pricing", {}) or {}
        if isinstance(pricing, dict):
            if "veg_price" in pricing or "non_veg_price" in pricing:
                res = {}
                if pricing.get("veg_price") is not None:
                    res["veg_price"] = float(pricing["veg_price"])
                if pricing.get("non_veg_price") is not None:
                    res["non_veg_price"] = float(pricing["non_veg_price"])
                res["pricing_mode"] = pricing.get("pricing_mode", "per_plate")
                return res

            if pricing.get("rental_price") is not None:
                return {
                    "price": float(pricing["rental_price"]),
                    "rental_price": float(pricing["rental_price"]),
                    "pricing_mode": "rental",
                }

            if pricing.get("base_price") is not None:
                return {
                    "price": float(pricing["base_price"]),
                    "pricing_mode": "starting_from",
                }

    return {}


def format_service_mini(service: Optional[Service]) -> Optional[Dict[str, Any]]:
    if not service:
        return None

    version = getattr(service, "current_live_version", None)

    # Name
    name = version.service_name if version else f"Service #{service.id}"

    # Image
    media_list = (getattr(version, "media", None) if version else None) or getattr(service, "media", None) or []
    image = None
    if media_list:
        cover = next((m for m in media_list if getattr(m, "is_cover", False)), media_list[0])
        image = getattr(cover, "media_url", None)

    # Location
    loc_parts = []
    if version:
        if version.area: loc_parts.append(version.area)
        if version.city: loc_parts.append(version.city)
        if version.state: loc_parts.append(version.state)
    location = ", ".join(loc_parts) if loc_parts else None

    # Vendor Name
    vendor_name = service.vendor.business_name if getattr(service, "vendor", None) else None

    # Rating
    rating_summary = getattr(service, "rating_summary", None)
    avg_rating = float(rating_summary.average_rating) if rating_summary else 0.0
    tot_reviews = rating_summary.total_reviews if rating_summary else 0

    return {
        "id": service.id,
        "name": name,
        "service_type": str(service.service_type.value) if hasattr(service.service_type, "value") else str(service.service_type),
        "image": image,
        "location": location,
        "pricing": extract_pricing(service),
        "rating": avg_rating,
        "total_reviews": tot_reviews,
        "vendor_name": vendor_name,
        "is_active": service.is_active and (service.deleted_at is None),
    }


def _service_load_options():
    return (
        selectinload(Service.current_live_version).selectinload(ServiceVersion.media),
        selectinload(Service.current_live_version).selectinload(ServiceVersion.variants),
        selectinload(Service.vendor),
        selectinload(Service.rating_summary),
    )


# ------------------------
# WISHLIST
# ------------------------

async def ensure_default_wishlist(db: AsyncSession, user_id: int) -> Wishlist:
    """Ensure customer has at least one default wishlist."""
    result = await db.execute(
        select(Wishlist)
        .options(
            selectinload(Wishlist.items)
            .selectinload(Favorite.service)
            .options(*_service_load_options())
        )
        .where(Wishlist.user_id == user_id)
        .order_by(Wishlist.is_default.desc(), Wishlist.created_at.asc())
    )
    wishlists = result.scalars().all()

    if not wishlists:
        default_w = Wishlist(
            user_id=user_id,
            name="My Favorites",
            description="My saved favorite services",
            is_default=True,
            is_public=False,
        )
        db.add(default_w)
        await db.commit()
        await db.refresh(default_w)

        res = await db.execute(
            select(Wishlist)
            .options(selectinload(Wishlist.items))
            .where(Wishlist.id == default_w.id)
        )
        return res.scalar_one()

    return wishlists[0]


async def create_wishlist(db: AsyncSession, user_id: int, data):
    try:
        wishlist = Wishlist(
            user_id=user_id,
            name=data.name.strip(),
            description=data.description,
            is_public=data.is_public,
            is_default=False,
        )
        db.add(wishlist)
        await db.commit()
        await db.refresh(wishlist)
        return wishlist
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create wishlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create wishlist")


async def get_user_wishlists(db: AsyncSession, user_id: int):
    await ensure_default_wishlist(db, user_id)

    result = await db.execute(
        select(Wishlist)
        .options(
            selectinload(Wishlist.items)
            .selectinload(Favorite.service)
            .options(*_service_load_options())
        )
        .where(Wishlist.user_id == user_id)
        .order_by(Wishlist.is_default.desc(), Wishlist.created_at.asc())
    )
    wishlists = result.scalars().all()

    formatted = []
    for w in wishlists:
        items = []
        for item in (w.items or []):
            if item.service and item.service.deleted_at is None:
                items.append({
                    "id": item.id,
                    "service_id": item.service_id,
                    "wishlist_id": item.wishlist_id,
                    "note": item.note or "",
                    "priority": map_priority(item.priority),
                    "service": format_service_mini(item.service),
                })
        formatted.append({
            "id": w.id,
            "user_id": w.user_id,
            "name": w.name,
            "description": w.description,
            "is_default": w.is_default,
            "is_public": w.is_public,
            "items": items,
            "created_at": w.created_at,
            "updated_at": w.updated_at,
        })

    return formatted


async def get_wishlist(db: AsyncSession, wishlist_id: int, user_id: int) -> Wishlist:
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.items))
        .where(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == user_id
        )
    )
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return wishlist


async def get_wishlist_detail(db: AsyncSession, wishlist_id: int, user_id: int):
    result = await db.execute(
        select(Wishlist)
        .options(
            selectinload(Wishlist.items)
            .selectinload(Favorite.service)
            .options(*_service_load_options())
        )
        .where(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == user_id
        )
    )
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    items = []
    for item in (wishlist.items or []):
        if item.service and item.service.deleted_at is None:
            items.append({
                "id": item.id,
                "service_id": item.service_id,
                "wishlist_id": item.wishlist_id,
                "note": item.note or "",
                "priority": map_priority(item.priority),
                "service": format_service_mini(item.service),
            })

    return {
        "id": wishlist.id,
        "name": wishlist.name,
        "description": wishlist.description,
        "is_public": wishlist.is_public,
        "items": items,
    }


async def update_wishlist(db: AsyncSession, wishlist_id: int, user_id: int, data):
    wishlist = await get_wishlist(db, wishlist_id, user_id)
    if data.name is not None:
        wishlist.name = data.name.strip()

    await db.commit()
    await db.refresh(wishlist)
    return wishlist


async def delete_wishlist(db: AsyncSession, wishlist_id: int, user_id: int):
    wishlist = await get_wishlist(db, wishlist_id, user_id)
    if wishlist.is_default:
        raise HTTPException(status_code=400, detail="Default wishlist cannot be deleted")

    await db.delete(wishlist)
    await db.commit()


# ------------------------
# WISHLIST ITEMS
# ------------------------

async def add_item(db: AsyncSession, user_id: int, data):
    # Validate wishlist ownership
    await get_wishlist(db, data.wishlist_id, user_id)

    # Validate service exists
    srv_res = await db.execute(
        select(Service)
        .options(*_service_load_options())
        .where(Service.id == data.service_id, Service.deleted_at.is_(None))
    )
    service = srv_res.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found or unavailable")

    item = Favorite(
        wishlist_id=data.wishlist_id,
        service_id=data.service_id,
    )

    try:
        db.add(item)
        await db.commit()
        await db.refresh(item)

        return {
            "id": item.id,
            "wishlist_id": item.wishlist_id,
            "service_id": item.service_id,
            "note": item.note or "",
            "priority": map_priority(item.priority),
            "service": format_service_mini(service),
        }

    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Service is already in this wishlist")


async def remove_item(db: AsyncSession, item_id: int, user_id: int):
    result = await db.execute(
        select(Favorite)
        .join(Wishlist)
        .where(
            Favorite.id == item_id,
            Wishlist.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    await db.delete(item)
    await db.commit()


async def update_item(db: AsyncSession, item_id: int, user_id: int, data):
    result = await db.execute(
        select(Favorite)
        .options(
            selectinload(Favorite.service).options(*_service_load_options())
        )
        .join(Wishlist)
        .where(
            Favorite.id == item_id,
            Wishlist.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    if data.note is not None:
        item.note = data.note
    if data.priority is not None:
        p_val = data.priority.value if hasattr(data.priority, "value") else str(data.priority)
        item.priority = PRIORITY_TO_INT.get(p_val, 0)

    await db.commit()
    await db.refresh(item)

    return {
        "id": item.id,
        "wishlist_id": item.wishlist_id,
        "service_id": item.service_id,
        "note": item.note or "",
        "priority": map_priority(item.priority),
        "service": format_service_mini(item.service),
    }


async def move_item(db: AsyncSession, item_id: int, user_id: int, target_wishlist_id: int):
    result = await db.execute(
        select(Favorite)
        .options(
            selectinload(Favorite.service).options(*_service_load_options())
        )
        .join(Wishlist)
        .where(
            Favorite.id == item_id,
            Wishlist.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    await get_wishlist(db, target_wishlist_id, user_id)
    item.wishlist_id = target_wishlist_id

    try:
        await db.commit()
        await db.refresh(item)
        return {
            "id": item.id,
            "wishlist_id": item.wishlist_id,
            "service_id": item.service_id,
            "note": item.note or "",
            "priority": map_priority(item.priority),
            "service": format_service_mini(item.service),
        }
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Item already exists in target wishlist")


async def find_item_by_service(db: AsyncSession, user_id: int, service_id: int):
    result = await db.execute(
        select(Favorite)
        .options(
            selectinload(Favorite.service).options(*_service_load_options())
        )
        .join(Wishlist)
        .where(
            Favorite.service_id == service_id,
            Wishlist.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        return None

    return {
        "id": item.id,
        "wishlist_id": item.wishlist_id,
        "service_id": item.service_id,
        "note": item.note or "",
        "priority": map_priority(item.priority),
        "service": format_service_mini(item.service),
    }