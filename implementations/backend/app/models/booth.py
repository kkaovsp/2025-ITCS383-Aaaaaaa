import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DECIMAL, Boolean, Integer
from sqlalchemy.orm import relationship

from .base import Base


class BoothType(str, Enum):
    INDOOR = "INDOOR"
    OUTDOOR = "OUTDOOR"


class BoothClassification(str, Enum):
    FIXED = "FIXED"
    TEMPORARY = "TEMPORARY"


class BoothDurationType(str, Enum):
    SHORT_TERM = "SHORT_TERM"
    LONG_TERM = "LONG_TERM"


class BoothStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    OCCUPIED = "OCCUPIED"


class Booth(Base):
    __tablename__ = "booths"

    booth_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.event_id"), nullable=False)
    booth_number = Column(String(20), nullable=False)
    size = Column(String(50), nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    location = Column(String(100), nullable=True)
    type = Column(Enum(BoothType), nullable=False)
    classification = Column(Enum(BoothClassification), nullable=False)
    duration_type = Column(Enum(BoothDurationType), nullable=False)
    electricity = Column(Boolean, default=False)
    water_supply = Column(Boolean, default=False)
    outlets = Column(Integer, default=0)
    status = Column(Enum(BoothStatus), nullable=False, default=BoothStatus.AVAILABLE)

    event = relationship("Event", back_populates="booths")
    reservations = relationship("Reservation", back_populates="booth")
