from pydantic import BaseModel, Field
from typing import Optional

from ..models.merchant import MerchantApprovalStatus


class MerchantBase(BaseModel):
    citizen_id: str = Field(..., max_length=20)
    seller_information: Optional[str] = None
    product_description: Optional[str] = None


class MerchantCreate(MerchantBase):
    pass


class MerchantRead(MerchantBase):
    merchant_id: str
    user_id: str
    approval_status: MerchantApprovalStatus
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None

    class Config:
        orm_mode = True
