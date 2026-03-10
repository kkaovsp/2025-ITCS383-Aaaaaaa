from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    contact_info: str
    role: str
    # merchant-specific fields; these are optional for non‑merchant users
    citizen_id: Optional[str] = None
    product_description: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str
