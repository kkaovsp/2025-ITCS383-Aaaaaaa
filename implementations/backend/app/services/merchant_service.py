from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.merchant import Merchant, MerchantApprovalStatus


async def list_pending_merchants(db: AsyncSession) -> list[Merchant]:
    result = await db.execute(select(Merchant).where(Merchant.approval_status == MerchantApprovalStatus.PENDING))
    return result.scalars().all()


async def approve_merchant(db: AsyncSession, merchant_id: str, approver_id: str) -> Merchant:
    result = await db.execute(select(Merchant).where(Merchant.merchant_id == merchant_id))
    merchant = result.scalars().first()
    if not merchant:
        raise ValueError("Merchant not found")
    merchant.approval_status = MerchantApprovalStatus.APPROVED
    merchant.approved_by = approver_id
    merchant.approved_at = datetime.utcnow()
    db.add(merchant)
    await db.commit()
    await db.refresh(merchant)
    return merchant
