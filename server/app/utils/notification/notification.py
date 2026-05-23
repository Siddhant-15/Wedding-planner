from sqlalchemy import select, func
from app.infrastructure.db.models.models import Notification


async def get_unread_count(db, recipient_id: int, recipient_type: str) -> int:
    result = await db.execute(
        select(func.count(Notification.id))
        .where(Notification.recipient_id == recipient_id)
        .where(Notification.recipient_type == recipient_type)
        .where(Notification.is_read == False)
    )
    return result.scalar_one_or_none() or 0


async def create_notification(
    db,
    recipient_id: int,
    recipient_type: str,
    type: str,
    title: str,
    message: str,
    data: dict = None
):
    notification = Notification(
        recipient_id=recipient_id,
        recipient_type=recipient_type,
        type=type,
        title=title,
        message=message,
        data=data or {}
    )

    db.add(notification)

    return notification