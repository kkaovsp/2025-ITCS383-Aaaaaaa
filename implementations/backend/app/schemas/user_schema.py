from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    contact_info: str
    # require merchant application details during registration
    citizen_id: str
    seller_information: str
    product_description: str


class UserLogin(BaseModel):
    username: str
    password: str
