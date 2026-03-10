from sqlalchemy import Column, String, Text, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import enum


class NotificationType(str, enum.Enum):
    RESERVATION = "RESERVATION"
    PAYMENT = "PAYMENT"
    MERCHANT_APPROVAL = "MERCHANT_APPROVAL"
    EVENT = "EVENT"
    SYSTEM = "SYSTEM"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    title = Column(String(150))
    message = Column(Text)
    type = Column(Enum(NotificationType))
    reference_id = Column(String(36))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime)

    user = relationship("User", back_populates="notifications")
