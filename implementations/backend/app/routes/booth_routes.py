from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.db_connection import get_db
from ..schemas.booth_schema import BoothCreate, BoothRead
from ..services.booth_service import (
    create_booth,
    list_booths_for_event,
    get_booth,
    update_booth,
    delete_booth,
)
from ..dependencies import require_role
from ..models.user import UserRole

router = APIRouter(prefix="/api/booths", tags=["booths"])


@router.get("/event/{event_id}", response_model=list[BoothRead])
async def get_booths_for_event(event_id: str, db: AsyncSession = Depends(get_db)):
    return await list_booths_for_event(db, event_id)


@router.post("", response_model=BoothRead)
async def create_booth_route(
    booth_in: BoothCreate,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await create_booth(db, booth_in)


@router.put("/{booth_id}", response_model=BoothRead)
async def update_booth_route(
    booth_id: str,
    booth_in: BoothCreate,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    booth = await get_booth(db, booth_id)
    if not booth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booth not found")
    return await update_booth(db, booth, booth_in)


@router.delete("/{booth_id}")
async def delete_booth_route(
    booth_id: str,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    booth = await get_booth(db, booth_id)
    if not booth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booth not found")
    await delete_booth(db, booth)
    return {"detail": "Booth deleted"}
