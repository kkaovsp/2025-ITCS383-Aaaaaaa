from typing import Optional
from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    contact_info: str
    role: str | None = None

    citizen_id: Optional[str] = None
    seller_information: Optional[str] = None
    product_description: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str
