from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.db_connection import get_db
from ..schemas.reservation_schema import ReservationCreate, ReservationRead
from ..services.reservation_service import create_reservation, list_reservations_for_user
from ..dependencies import require_role, get_current_user
from ..models.user import UserRole

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.post("", response_model=ReservationRead)
async def create_reservation_route(
    reservation_in: ReservationCreate,
    current_user=Depends(require_role(UserRole.MERCHANT)),
    db: AsyncSession = Depends(get_db),
):
    # Ensure merchant can only create for themselves
    if reservation_in.merchant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot reserve for other merchant")
    return await create_reservation(db, reservation_in)


@router.get("", response_model=list[ReservationRead])
async def get_my_reservations(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_reservations_for_user(db, merchant_id=current_user.id)
