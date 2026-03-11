from pydantic import BaseModel
from datetime import date


class EventCreate(BaseModel):
    name: str
    description: str
    location: str
    start_date: date
    end_date: date
