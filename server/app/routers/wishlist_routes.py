from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.wishlist import *
from app.controller import wishlist_controller as controller
from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user

wishlistrouter = APIRouter(prefix="/wishlists", tags=["Wishlist"])


# ------------------------
# Wishlist
# ------------------------

@wishlistrouter.post("/")
async def create(
    data: WishlistCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.create_wishlist(db, user["id"], data)


@wishlistrouter.get("/", response_model=list[WishlistResponse])
async def list_all(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.get_user_wishlists(db, user["id"])


@wishlistrouter.get("/{wishlist_id}", response_model=WishlistDetailResponse)
async def get_one(
    wishlist_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.get_wishlist_detail(db, wishlist_id, user["id"])


@wishlistrouter.patch("/{wishlist_id}", response_model=WishlistResponse)
async def update(
    wishlist_id: int,
    data: WishlistUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.update_wishlist(db, wishlist_id, user["id"], data)


@wishlistrouter.delete("/{wishlist_id}")
async def delete(
    wishlist_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    await controller.delete_wishlist(db, wishlist_id, user["id"])
    return {"message": "Wishlist deleted"}


# ------------------------
# Wishlist Items
# ------------------------

@wishlistrouter.post("/items", response_model=WishlistItemAddResponse)
async def add_item(
    data: WishlistItemCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.add_item(db, user["id"], data)


@wishlistrouter.delete("/items/{item_id}")
async def remove_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    await controller.remove_item(db, item_id, user["id"])
    return {"message": "Item removed"}


@wishlistrouter.patch("/items/{item_id}")
async def update_item(
    item_id: int,
    data: WishlistItemUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.update_item(db, item_id, user["id"], data)


@wishlistrouter.post("/items/{item_id}/move", response_model=WishlistItemResponse)
async def move_item(
    item_id: int,
    target_wishlist_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.move_item(db, item_id, user["id"], target_wishlist_id)


@wishlistrouter.get("/items/by-service/{service_id}", response_model=WishlistItemResponse | None)
async def find_by_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await controller.find_item_by_service(db, user["id"], service_id)