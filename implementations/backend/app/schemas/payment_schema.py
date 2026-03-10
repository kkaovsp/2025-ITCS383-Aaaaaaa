from pydantic import BaseModel

class PaymentCreate(BaseModel):
    reservation_id: str
    amount: float
    method: str
