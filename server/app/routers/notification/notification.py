from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.models import Notification
from app.Dependencies.Auth import get_current_user
from app.Db.db import get_db

NotificationRouter = APIRouter(prefix="/notification", tags=["Notifications"])

@NotificationRouter.get("/get-all")
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(Notification)
        .where(
            Notification.recipient_id == user["id"],
            Notification.recipient_type == user["role"]  # "vendor" or "customer"
        )
        .order_by(Notification.created_at.desc())
    )

    return result.scalars().all()


@NotificationRouter.get("/unread-count")
async def unread_count(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(func.count())
        .where(
            Notification.recipient_id == user["id"],
            Notification.recipient_type == user["role"],
            Notification.is_read == False
        )
    )

    return {"count": result.scalar()}


@NotificationRouter.post("/mark-read/{id}")
async def mark_read(id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    await db.execute(
        update(Notification)
        .where(
            Notification.id == id,
            Notification.recipient_id == user["id"]
        )
        .values(is_read=True)
    )

    await db.commit()
    return {"success": True}