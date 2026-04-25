# app/controllers/wishlist_controller.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Service, Wishlist, WishlistItem


# ------------------------
# Wishlist
# ------------------------

def create_wishlist(db: Session, user_id: int, data):
    wishlist = Wishlist(
        user_id=user_id,
        name=data.name,
        description=data.description,
        is_public=data.is_public,
        is_default=False
    )
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return wishlist


def get_user_wishlists(db: Session, user_id: int):
    return db.query(Wishlist).filter(Wishlist.user_id == user_id).all()


def get_wishlist(db: Session, wishlist_id: int, user_id: int):
    wishlist = db.query(Wishlist).filter(
        Wishlist.id == wishlist_id,
        Wishlist.user_id == user_id
    ).first()

    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    return wishlist


def delete_wishlist(db: Session, wishlist_id: int, user_id: int):
    wishlist = get_wishlist(db, wishlist_id, user_id)
    db.delete(wishlist)
    db.commit()


# ------------------------
# Wishlist Items
# ------------------------

def add_item(db: Session, user_id: int, data):
    # validate wishlist ownership
    wishlist = get_wishlist(db, data.wishlist_id, user_id)

    # validate service exists
    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # check duplicate
    existing = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == data.wishlist_id,
        WishlistItem.service_id == data.service_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already in wishlist")

    item = WishlistItem(
        wishlist_id=data.wishlist_id,
        service_id=data.service_id
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def remove_item(db: Session, item_id: int, user_id: int):
    item = db.query(WishlistItem).join(Wishlist).filter(
        WishlistItem.id == item_id,
        Wishlist.user_id == user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()


def update_item(db: Session, item_id: int, user_id: int, data):
    item = db.query(WishlistItem).join(Wishlist).filter(
        WishlistItem.id == item_id,
        Wishlist.user_id == user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if data.note is not None:
        item.note = data.note

    if data.priority is not None:
        item.priority = data.priority

    db.commit()
    db.refresh(item)

    return item