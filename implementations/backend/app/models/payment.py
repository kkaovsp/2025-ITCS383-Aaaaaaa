import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DECIMAL, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class PaymentMethod(str, Enum):
    CREDIT_CARD = "CREDIT_CARD"
    TRUEMONEY = "TRUEMONEY"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String(36), ForeignKey("reservations.reservation_id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    payment_status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    slip_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reservation = relationship("Reservation", back_populates="payments")
