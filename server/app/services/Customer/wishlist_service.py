from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.infrastructure.db.models.models import Wishlist, WishlistItem
from app.repositories.Customer.wishlist_queries import *
from app.utils.Customer.wishlist_utils import map_priority, extract_pricing, PRIORITY_TO_INT, map_priority


class WishlistService:

    # ───────── CREATE WISHLIST ─────────
    @staticmethod
    async def create(db: AsyncSession, user_id: int, data):
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

    # ───────── LIST ─────────
    @staticmethod
    async def list(db, user_id: int):
        result = await db.execute(get_user_wishlists_q(user_id))
        return result.scalars().all()

    # ───────── DETAIL ─────────
    @staticmethod
    async def detail(db, wishlist_id: int, user_id: int):
        result = await db.execute(get_wishlist_detail_q(wishlist_id, user_id))
        wishlist = result.scalar_one_or_none()

        if not wishlist:
            raise HTTPException(404, "Wishlist not found")

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
                        "image": item.service.media[0].media_url if item.service.media else None,
                        "location": item.service.city,
                        "pricing": extract_pricing(item.service),
                    },
                }
                for item in wishlist.items
            ],
        }

    # ───────── UPDATE ─────────
    @staticmethod
    async def update(db, wishlist_id, user_id, data):
        wishlist = await WishlistService._get(db, wishlist_id, user_id)

        if data.name:
            wishlist.name = data.name.strip()

        await db.commit()
        await db.refresh(wishlist)
        return wishlist

    # ───────── DELETE ─────────
    @staticmethod
    async def delete(db, wishlist_id, user_id):
        wishlist = await WishlistService._get(db, wishlist_id, user_id)

        if wishlist.is_default:
            raise HTTPException(400, "Default wishlist cannot be deleted")

        await db.delete(wishlist)
        await db.commit()

    # ───────── ITEMS ─────────
    @staticmethod
    async def add_item(db, user_id, data):
        await WishlistService._get(db, data.wishlist_id, user_id)

        result = await db.execute(get_service_q(data.service_id))
        service = result.scalar_one_or_none()

        if not service:
            raise HTTPException(404, "Service not found")

        item = WishlistItem(
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
            raise HTTPException(400, "Already in wishlist")

    @staticmethod
    async def remove_item(db, item_id, user_id):
        item = await WishlistService._get_item(db, item_id, user_id)

        await db.delete(item)
        await db.commit()

    @staticmethod
    async def update_item(db, item_id, user_id, data):
        item = await WishlistService._get_item(db, item_id, user_id)

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

    @staticmethod
    async def move_item(db, item_id, user_id, target_wishlist_id):
        item = await WishlistService._get_item(db, item_id, user_id)

        await WishlistService._get(db, target_wishlist_id, user_id)

        item.wishlist_id = target_wishlist_id

        try:
            await db.commit()
            await db.refresh(item)
            return item
        except IntegrityError:
            await db.rollback()
            raise HTTPException(400, "Move failed")

    @staticmethod
    async def find_by_service(db, user_id, service_id):
        result = await db.execute(get_item_by_service_q(service_id, user_id))
        return result.scalar_one_or_none()

    # ───────── INTERNAL HELPERS ─────────
    @staticmethod
    async def _get(db, wishlist_id, user_id):
        result = await db.execute(get_wishlist_q(wishlist_id, user_id))
        wishlist = result.scalar_one_or_none()

        if not wishlist:
            raise HTTPException(404, "Wishlist not found")

        return wishlist

    @staticmethod
    async def _get_item(db, item_id, user_id):
        result = await db.execute(get_item_by_id_q(item_id, user_id))
        item = result.scalar_one_or_none()

        if not item:
            raise HTTPException(404, "Item not found")

        return item