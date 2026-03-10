from sqlalchemy import Column, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import enum
from sqlalchemy import Integer


class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Merchant(Base):
    __tablename__ = "merchants"

    merchant_id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    citizen_id = Column(String(20))
    seller_information = Column(Text)
    product_description = Column(Text)
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    approved_by = Column(String(36))
    approved_at = Column(DateTime)
    citizen_valid = Column(Integer, default=0)

    user = relationship("User", back_populates="merchant")
    reservations = relationship("Reservation", back_populates="merchant")
