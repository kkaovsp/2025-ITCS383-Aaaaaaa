from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.db_connection import get_db
from ..schemas.payment_schema import PaymentCreate, PaymentRead
from ..services.payment_service import create_payment, approve_payment
from ..dependencies import require_role
from ..models.user import UserRole

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("", response_model=PaymentRead)
async def create_payment_route(
    payment_in: PaymentCreate,
    current_user=Depends(require_role(UserRole.MERCHANT)),
    db: AsyncSession = Depends(get_db),
):
    return await create_payment(db, payment_in)


@router.post("/{payment_id}/approve", response_model=PaymentRead)
async def approve_payment_route(
    payment_id: str,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await approve_payment(db, payment_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
