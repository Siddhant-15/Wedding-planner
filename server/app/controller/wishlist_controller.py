from app.schemas.wishlist import WishlistItemResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from app.models.models import Service, Wishlist, Favorite


PRIORITY_TO_INT = {
    "low": 0,
    "medium": 1,
    "high": 2,
}
def map_priority(p: int) -> str:
    return {0: "low", 1: "medium", 2: "high"}.get(p, "low")

def extract_pricing(service):
    if not service.variants:
        return {}

    for variant in service.variants:
        pricing = variant.pricing or {}

        result = {}

        # 🟢 Veg / Non-veg case
        if "veg_price" in pricing or "non_veg_price" in pricing:
            if pricing.get("veg_price") is not None:
                result["veg_price"] = float(pricing["veg_price"])

            if pricing.get("non_veg_price") is not None:
                result["non_veg_price"] = float(pricing["non_veg_price"])

            result["pricing_mode"] = pricing.get("pricing_mode", "per_plate")
            return result

        # 🟢 Rental
        if pricing.get("rental_price") is not None:
            return {
                "price": float(pricing["rental_price"]),
                "pricing_mode": "rental"
            }

        # 🟢 Base price
        if pricing.get("base_price") is not None:
            return {
                "price": float(pricing["base_price"]),
                "pricing_mode": "starting_from"
            }

    return {}

# ------------------------
# WISHLIST
# ------------------------

async def create_wishlist(db: AsyncSession, user_id: int, data):
    try:
        wishlist = Wishlist(
            user_id=user_id,
            name=data.name.strip(),
            description=data.description,
            is_public=data.is_public,
            is_default=False
        )

        db.add(wishlist)
        await db.commit()
        await db.refresh(wishlist)
        return wishlist

    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create wishlist")


async def get_user_wishlists(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.items))
        .where(Wishlist.user_id == user_id)
    )
    return result.scalars().all()


async def get_wishlist(db: AsyncSession, wishlist_id: int, user_id: int):
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
            .selectinload(Service.media),

            selectinload(Wishlist.items)
            .selectinload(Favorite.service)
            .selectinload(Service.variants),
        )
        .where(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == user_id
        )
    )

    wishlist = result.scalar_one_or_none()

    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    return {
        "id": wishlist.id,
        "name": wishlist.name,
        "description": wishlist.description,
        "is_public": wishlist.is_public,
        "items": [
            {
                "id": item.id,
                "service_id": item.service_id,
                "wishlist_id": item.wishlist_id,
                "note": item.note or "",
                "priority": map_priority(item.priority),
                "service": {
                    "id": item.service.id,
                    "name": item.service.service_name,
                    "service_type": item.service.service_type,
                    "image": (
                        item.service.media[0].media_url
                        if item.service.media else None
                    ),
                    "location": item.service.city,
                    "pricing": extract_pricing(item.service),
                },
            }
            for item in wishlist.items
        ],
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
    await get_wishlist(db, data.wishlist_id, user_id)

    result = await db.execute(
        select(Service).where(Service.id == data.service_id)
    )
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    item = Favorite(
        wishlist_id=data.wishlist_id,
        service_id=data.service_id
    )

    try:
        db.add(item)
        await db.commit()
        await db.refresh(item)

        return {
    "id": item.id,
    "wishlist_id": item.wishlist_id,
    "service_id": item.service_id,
    "note": None,
    "priority": None,
    "service": None
}

    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Already in wishlist")



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
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()


async def update_item(db: AsyncSession, item_id: int, user_id: int, data):

    result = await db.execute(
        select(Favorite)
        .options(selectinload(Favorite.service))
        .join(Wishlist)
        .where(
            Favorite.id == item_id,
            Wishlist.user_id == user_id 
        )
    )

    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if data.note is not None:
        item.note = data.note

    if data.priority is not None:
        item.priority = PRIORITY_TO_INT[data.priority.value]

    await db.commit()
    await db.refresh(item)

    return {
        "priority": map_priority(item.priority),
        "note": item.note,
        "message": "Item updated successfully"
    }


async def move_item(db: AsyncSession, item_id: int, user_id: int, target_wishlist_id: int):
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
        raise HTTPException(status_code=404, detail="Item not found")

    await get_wishlist(db, target_wishlist_id, user_id)

    item.wishlist_id = target_wishlist_id

    try:
        await db.commit()
        await db.refresh(item)
        return item

    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Move failed")


async def find_item_by_service(db: AsyncSession, user_id: int, service_id: int):
    result = await db.execute(
        select(Favorite)
        .join(Wishlist)
        .where(
            Favorite.service_id == service_id,
            Wishlist.user_id == user_id
        )
    )

    return result.scalar_one_or_none()