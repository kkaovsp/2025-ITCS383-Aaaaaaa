from pydantic import BaseModel, Field
from typing import Optional

from ..models.payment import PaymentMethod, PaymentStatus


class PaymentBase(BaseModel):
    reservation_id: str
    amount: float
    method: PaymentMethod
    slip_url: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentRead(PaymentBase):
    payment_id: str
    payment_status: PaymentStatus
    created_at: Optional[str] = None

    class Config:
        orm_mode = True
