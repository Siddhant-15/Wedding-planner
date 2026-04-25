from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.wishlist import *
from app.controller import wishlist_controller as controller
from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user

wishlistrouter = APIRouter(prefix="/wishlists", tags=["Wishlist"])


# ------------------------
# Wishlist
# ------------------------

@wishlistrouter.post("/", response_model=WishlistResponse)
def create(data: WishlistCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return controller.create_wishlist(db, user.id, data)


@wishlistrouter.get("/", response_model=list[WishlistResponse])
def list_all(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return controller.get_user_wishlists(db, user.id)


@wishlistrouter.get("/{wishlist_id}", response_model=WishlistResponse)
def get_one(wishlist_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return controller.get_wishlist(db, wishlist_id, user.id)


@wishlistrouter.delete("/{wishlist_id}")
def delete(wishlist_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    controller.delete_wishlist(db, wishlist_id, user.id)
    return {"message": "Wishlist deleted"}


# ------------------------
# Wishlist Items
# ------------------------

@wishlistrouter.post("/items", response_model=WishlistItemResponse)
def add_item(data: WishlistItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return controller.add_item(db, user.id, data)


@wishlistrouter.delete("/items/{item_id}")
def remove_item(item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    controller.remove_item(db, item_id, user.id)
    return {"message": "Item removed"}


@wishlistrouter.patch("/items/{item_id}", response_model=WishlistItemResponse)
def update_item(item_id: int, data: WishlistItemUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return controller.update_item(db, item_id, user.id, data)