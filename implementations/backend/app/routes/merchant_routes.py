from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.db_connection import get_db
from ..dependencies import require_role, get_current_user
from ..models.user import UserRole
from ..services.merchant_service import list_pending_merchants, approve_merchant
from ..schemas.merchant_schema import MerchantRead

router = APIRouter(prefix="/api/merchants", tags=["merchants"])


@router.get("/pending", response_model=list[MerchantRead])
async def get_pending_merchants(
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await list_pending_merchants(db)


@router.post("/{merchant_id}/approve", response_model=MerchantRead)
async def approve_merchant_route(
    merchant_id: str,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await approve_merchant(db, merchant_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
