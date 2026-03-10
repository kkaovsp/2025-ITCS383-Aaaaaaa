from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from ..models.user import UserRole


class UserBase(BaseModel):
    username: str = Field(..., max_length=50)
    name: str = Field(..., max_length=100)
    contact_info: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    citizen_id: Optional[str] = None
    seller_information: Optional[str] = None
    product_description: Optional[str] = None


class UserRead(UserBase):
    id: str
    created_at: Optional[str] = None

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
