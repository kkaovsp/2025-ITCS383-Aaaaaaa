from pydantic import BaseModel

class EventCreate(BaseModel):
    name: str
    description: str
    location: str
    start_date: str
    end_date: str
