from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Event(Base):
    __tablename__ = "events"

    event_id = Column(String(36), primary_key=True, index=True)
    name = Column(String(150))
    description = Column(Text)
    location = Column(String(200))
    start_date = Column(Date)
    end_date = Column(Date)
    created_by = Column(String(36))
    created_at = Column(DateTime)

    booths = relationship("Booth", back_populates="event")
