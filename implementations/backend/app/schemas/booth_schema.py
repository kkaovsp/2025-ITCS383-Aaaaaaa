from pydantic import BaseModel, Field
from typing import Optional

from ..models.booth import BoothType, BoothClassification, BoothDurationType, BoothStatus


class BoothBase(BaseModel):
    event_id: str
    booth_number: str = Field(..., max_length=20)
    size: Optional[str] = None
    price: float
    location: Optional[str] = None
    type: BoothType
    classification: BoothClassification
    duration_type: BoothDurationType
    electricity: bool = False
    water_supply: bool = False
    outlets: int = 0
    status: BoothStatus = BoothStatus.AVAILABLE


class BoothCreate(BoothBase):
    pass


class BoothRead(BoothBase):
    booth_id: str

    class Config:
        orm_mode = True
