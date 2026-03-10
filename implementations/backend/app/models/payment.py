from sqlalchemy import Column, String, DECIMAL, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import enum


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "CREDIT_CARD"
    TRUEMONEY = "TRUEMONEY"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(String(36), primary_key=True, index=True)
    reservation_id = Column(String(36), ForeignKey("reservations.reservation_id"))
    amount = Column(DECIMAL(10, 2))
    method = Column(Enum(PaymentMethod))
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    slip_url = Column(String(255))
    created_at = Column(DateTime)

    reservation = relationship("Reservation", back_populates="payments")
