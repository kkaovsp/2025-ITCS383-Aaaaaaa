from pydantic import BaseModel
from typing import Optional


class BoothCreate(BaseModel):
    event_id: str
    booth_number: str
    size: str
    price: float
    location: Optional[str] = None
    electricity: Optional[bool] = False
    outlets: Optional[int] = 0
    water_supply: Optional[bool] = False
    type: Optional[str] = None
    duration_type: Optional[str] = None
    classification: Optional[str] = None
