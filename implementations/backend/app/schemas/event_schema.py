from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


class EventBase(BaseModel):
    name: str = Field(..., max_length=150)
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: date
    end_date: date


class EventCreate(EventBase):
    pass


class EventRead(EventBase):
    event_id: str
    created_by: str
    created_at: Optional[str] = None

    class Config:
        orm_mode = True
