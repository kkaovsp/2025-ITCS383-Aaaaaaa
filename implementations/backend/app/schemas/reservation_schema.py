from pydantic import BaseModel

class ReservationCreate(BaseModel):
    booth_id: str
    # merchant_id removed; the server infers this from the authenticated user
    reservation_type: str
