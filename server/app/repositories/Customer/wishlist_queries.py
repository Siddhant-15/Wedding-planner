from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.infrastructure.db.models.models import Wishlist, WishlistItem, Service


def get_user_wishlists_q(user_id: int):
    return (
        select(Wishlist)
        .options(selectinload(Wishlist.items))
        .where(Wishlist.user_id == user_id)
    )


def get_wishlist_q(wishlist_id: int, user_id: int):
    return (
        select(Wishlist)
        .options(selectinload(Wishlist.items))
        .where(Wishlist.id == wishlist_id, Wishlist.user_id == user_id)
    )


def get_wishlist_detail_q(wishlist_id: int, user_id: int):
    return (
        select(Wishlist)
        .options(
            selectinload(Wishlist.items)
            .selectinload(WishlistItem.service)
            .selectinload(Service.media),

            selectinload(Wishlist.items)
            .selectinload(WishlistItem.service)
            .selectinload(Service.variants),
        )
        .where(Wishlist.id == wishlist_id, Wishlist.user_id == user_id)
    )


def get_item_by_id_q(item_id: int, user_id: int):
    return (
        select(WishlistItem)
        .join(Wishlist)
        .where(WishlistItem.id == item_id, Wishlist.user_id == user_id)
    )


def get_item_by_service_q(service_id: int, user_id: int):
    return (
        select(WishlistItem)
        .join(Wishlist)
        .where(WishlistItem.service_id == service_id, Wishlist.user_id == user_id)
    )


def get_service_q(service_id: int):
    return select(Service).where(Service.id == service_id)