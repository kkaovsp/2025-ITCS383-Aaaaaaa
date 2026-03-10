from pydantic import BaseModel
from typing import Optional

from ..models.reservation import ReservationStatus, ReservationType


class ReservationBase(BaseModel):
    booth_id: str
    merchant_id: str
    reservation_type: ReservationType


class ReservationCreate(ReservationBase):
    pass


class ReservationRead(ReservationBase):
    reservation_id: str
    status: ReservationStatus
    created_at: Optional[str] = None

    class Config:
        orm_mode = True
