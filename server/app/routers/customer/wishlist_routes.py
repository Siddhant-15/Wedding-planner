from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user
from app.services.Customer.wishlist_service import WishlistService
from app.schemas.wishlist import *

router = APIRouter(prefix="/wishlists", tags=["Wishlist"])


@router.post("/")
async def create(data: WishlistCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await WishlistService.create(db, user["id"], data)


@router.get("/", response_model=list[WishlistResponse])
async def list_all(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await WishlistService.list(db, user["id"])


@router.get("/{wishlist_id}")
async def get_one(wishlist_id: int, db=Depends(get_db), user=Depends(get_current_user)):
    return await WishlistService.detail(db, wishlist_id, user["id"])


@router.patch("/{wishlist_id}")
async def update(wishlist_id: int, data: WishlistUpdate, db=Depends(get_db), user=Depends(get_current_user)):
    return await WishlistService.update(db, wishlist_id, user["id"], data)


@router.delete("/{wishlist_id}")
async def delete(wishlist_id: int, db=Depends(get_db), user=Depends(get_current_user)):
    await WishlistService.delete(db, wishlist_id, user["id"])
    return {"message": "Wishlist deleted"}


@router.post("/items")
async def add_item(data: WishlistItemCreate, db=Depends(get_db), user=Depends(get_current_user)):
    return await WishlistService.add_item(db, user["id"], data)

@router.patch("/items/{item_id}")
async def update_item(
    item_id: int,
    data: WishlistItemUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await WishlistService.update_item(db, item_id, user["id"], data)

@router.post("/items/{item_id}/move")
async def move_item(
    item_id: int,
    target_wishlist_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await WishlistService.move_item(
        db, item_id, user["id"], target_wishlist_id
    )

@router.get("/items/by-service/{service_id}")
async def find_by_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await WishlistService.find_by_service(db, user["id"], service_id)


@router.delete("/items/{item_id}")
async def remove_item(item_id: int, db=Depends(get_db), user=Depends(get_current_user)):
    await WishlistService.remove_item(db, item_id, user["id"])
    return {"message": "Item removed"}