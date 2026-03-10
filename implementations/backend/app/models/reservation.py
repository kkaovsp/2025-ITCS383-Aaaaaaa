from sqlalchemy import Column, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import enum


class ReservationType(str, enum.Enum):
    SHORT_TERM = "SHORT_TERM"
    LONG_TERM = "LONG_TERM"


class ReservationStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(String(36), primary_key=True, index=True)
    booth_id = Column(String(36), ForeignKey("booths.booth_id"))
    merchant_id = Column(String(36), ForeignKey("merchants.merchant_id"))
    reservation_type = Column(Enum(ReservationType))
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING_PAYMENT)
    created_at = Column(DateTime)

    booth = relationship("Booth", back_populates="reservations")
    merchant = relationship("Merchant", back_populates="reservations")
    payments = relationship("Payment", back_populates="reservation")
