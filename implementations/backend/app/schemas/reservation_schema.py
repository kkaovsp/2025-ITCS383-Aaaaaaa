from pydantic import BaseModel

class ReservationCreate(BaseModel):
    booth_id: str
    merchant_id: str
    reservation_type: str
