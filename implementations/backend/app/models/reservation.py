import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class ReservationType(str, Enum):
    SHORT_TERM = "SHORT_TERM"
    LONG_TERM = "LONG_TERM"


class ReservationStatus(str, Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booth_id = Column(String(36), ForeignKey("booths.booth_id"), nullable=False)
    merchant_id = Column(String(36), ForeignKey("merchants.merchant_id"), nullable=False)
    reservation_type = Column(Enum(ReservationType), nullable=False)
    status = Column(Enum(ReservationStatus), nullable=False, default=ReservationStatus.PENDING_PAYMENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booth = relationship("Booth", back_populates="reservations")
    merchant = relationship("Merchant")
    payments = relationship("Payment", back_populates="reservation")
