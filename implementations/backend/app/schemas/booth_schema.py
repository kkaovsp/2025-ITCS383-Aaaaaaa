from pydantic import BaseModel

class BoothCreate(BaseModel):
    event_id: str
    booth_number: str
    size: str
    price: float
