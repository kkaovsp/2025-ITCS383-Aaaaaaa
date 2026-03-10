from sqlalchemy import Column, String, Text, DateTime, Enum, Boolean, Integer, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import enum


class BoothType(str, enum.Enum):
    INDOOR = "INDOOR"
    OUTDOOR = "OUTDOOR"


class Classification(str, enum.Enum):
    FIXED = "FIXED"
    TEMPORARY = "TEMPORARY"


class DurationType(str, enum.Enum):
    SHORT_TERM = "SHORT_TERM"
    LONG_TERM = "LONG_TERM"


class BoothStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    OCCUPIED = "OCCUPIED"


class Booth(Base):
    __tablename__ = "booths"

    booth_id = Column(String(36), primary_key=True, index=True)
    event_id = Column(String(36), ForeignKey("events.event_id"))
    booth_number = Column(String(20))
    size = Column(String(50))
    price = Column(DECIMAL(10, 2))
    location = Column(String(100))
    type = Column(Enum(BoothType))
    classification = Column(Enum(Classification))
    duration_type = Column(Enum(DurationType))
    electricity = Column(Boolean, default=False)
    water_supply = Column(Boolean, default=False)
    outlets = Column(Integer)
    status = Column(Enum(BoothStatus), default=BoothStatus.AVAILABLE)

    event = relationship("Event", back_populates="booths")
    reservations = relationship("Reservation", back_populates="booth")
