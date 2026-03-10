from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.notification import Notification
from ..schemas.notification_schema import NotificationBase


async def create_notification(db: AsyncSession, user_id: str, notification_in: NotificationBase) -> Notification:
    notification = Notification(user_id=user_id, **notification_in.model_dump())
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def list_notifications(db: AsyncSession, user_id: str) -> list[Notification]:
    result = await db.execute(select(Notification).where(Notification.user_id == user_id))
    return result.scalars().all()


async def mark_read(db: AsyncSession, notification_id: str) -> Notification:
    result = await db.execute(select(Notification).where(Notification.notification_id == notification_id))
    notification = result.scalars().first()
    if not notification:
        raise ValueError("Notification not found")
    notification.is_read = True
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification
