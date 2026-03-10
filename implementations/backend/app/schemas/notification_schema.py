from pydantic import BaseModel
from typing import Optional

from ..models.notification import NotificationType


class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType
    reference_id: Optional[str] = None


class NotificationRead(NotificationBase):
    notification_id: str
    user_id: str
    is_read: bool
    created_at: Optional[str] = None

    class Config:
        orm_mode = True
