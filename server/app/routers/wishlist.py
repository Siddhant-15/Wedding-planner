# app/api/v1/wishlist.py
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, delete, insert

from app.database import get_db
from app.core.security import get_current_user
from app.models.models import Service, User, WishlistItem
from app.schemas.wishlist import WishlistItemOut, WishlistItemCreate

wishlistrouter = APIRouter(prefix="/wishlist", tags=["wishlist"])


# =========================================================================== #
#  GET /wishlist/ → List all wishlist items with full service data
# =========================================================================== #
@wishlistrouter.get("/", response_model=List[WishlistItemOut])
def read_wishlist(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[WishlistItemOut]:
    """
    Retrieve **all wishlist items** for the authenticated user.

    - Includes full service details (name, price, image, etc.)
    - Ordered by `created_at DESC`
    - Uses `joinedload` to avoid N+1 queries
    """
    items = (
        db.execute(
            select(WishlistItem)
            .options(joinedload(WishlistItem.service))
            .where(WishlistItem.user_id == current_user.id)
            .order_by(WishlistItem.created_at.desc())
        )
        .scalars()
        .all()
    )
    print(f"All Wishlist for {current_user.first_name}",items)
    return items


# =========================================================================== #
#  POST /wishlist/{service_id} → Add service to wishlist
# =========================================================================== #
@wishlistrouter.post("/{service_id}",response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    *,
    db: Session = Depends(get_db),
    service_id: UUID,
    current_user: User = Depends(get_current_user),
) -> WishlistItemOut:
    """
    Add a service to the user's wishlist.

    - **Idempotent**: Returns existing item if already present
    - Validates service existence
    - Uses `UNIQUE(user_id, service_id)` constraint safely
    """
    # 1. Verify service exists
    service_exists = db.execute(
        select(Service.id).where(Service.id == service_id)
    ).scalar_one_or_none()
    print("Service:",service_exists)

    if not service_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # 2. Check if already in wishlist
    existing = db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.service_id == service_id
        )
    ).scalar_one_or_none()
    print("Existing Wishlist",existing)

    if existing:
        # Load service to return full payload
        db.refresh(existing, ["service"])
        return existing

    # 3. Insert new wishlist item
    stmt = insert(WishlistItem).values(
        user_id=current_user.id,
        service_id=service_id
    ).returning(WishlistItem)

    result = db.execute(stmt)
    db.commit()
    new_item = result.scalar_one()
    print("New Wishlist",new_item)

    # Load service relationship
    db.refresh(new_item, ["service"])
    print("Refresh")
    return new_item


# =========================================================================== #
#  DELETE /wishlist/{service_id} → Remove item from wishlist
# =========================================================================== #
@wishlistrouter.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    *,
    db: Session = Depends(get_db),
    service_id: UUID,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Remove a service from the user's wishlist.

    - **Idempotent**: 204 even if item doesn't exist
    """
    stmt = delete(WishlistItem).where(
        WishlistItem.user_id == current_user.id,
        WishlistItem.service_id == service_id
    )

    result = db.execute(stmt)
    db.commit()

    # Always return 204 — client state is correct
    return None


# =========================================================================== #
#  DELETE /wishlist/ → Clear entire wishlist
# =========================================================================== #
@wishlistrouter.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_wishlist(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete **all** wishlist items for the current user.
    """
    stmt = delete(WishlistItem).where(WishlistItem.user_id == current_user.id)
    db.execute(stmt)
    db.commit()
    return None