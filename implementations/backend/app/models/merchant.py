import uuid
from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class MerchantApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Merchant(Base):
    __tablename__ = "merchants"

    # Use the same UUID as the user to simplify mapping
    merchant_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    citizen_id = Column(String(20), nullable=False)
    seller_information = Column(Text, nullable=True)
    product_description = Column(Text, nullable=True)
    approval_status = Column(Enum(MerchantApprovalStatus), nullable=False, default=MerchantApprovalStatus.PENDING)
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="merchant")
