import uuid
from sqlalchemy import Column, String, Text, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class NotificationType(str, Enum):
    RESERVATION = "RESERVATION"
    PAYMENT = "PAYMENT"
    MERCHANT_APPROVAL = "MERCHANT_APPROVAL"
    EVENT = "EVENT"
    SYSTEM = "SYSTEM"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False, default=NotificationType.SYSTEM)
    reference_id = Column(String(36), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
