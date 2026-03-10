from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.db_connection import get_db
from ..services.notification_service import list_notifications, mark_read
from ..schemas.notification_schema import NotificationRead
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
async def get_notifications(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_notifications(db, user_id=current_user.id)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notification = await mark_read(db, notification_id)
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot mark notification for another user")
    return notification
