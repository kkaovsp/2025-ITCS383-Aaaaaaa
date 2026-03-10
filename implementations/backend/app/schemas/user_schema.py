from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    contact_info: str
    role: str
    # merchant-specific fields
    citizen_id: Optional[str]
    product_description: Optional[str]


class UserLogin(BaseModel):
    username: str
    password: str
