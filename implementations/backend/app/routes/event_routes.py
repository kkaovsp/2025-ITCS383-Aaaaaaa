from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.db_connection import get_db
from ..schemas.event_schema import EventCreate, EventRead
from ..services.event_service import create_event, list_events, get_event, update_event, delete_event
from ..dependencies import require_role
from ..models.user import UserRole

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventRead])
async def get_events(db: AsyncSession = Depends(get_db)):
    return await list_events(db)


@router.post("", response_model=EventRead)
async def create_event_route(
    event_in: EventCreate,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await create_event(db, event_in, created_by=current_user.id)


@router.put("/{event_id}", response_model=EventRead)
async def update_event_route(
    event_id: str,
    event_in: EventCreate,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    event = await get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return await update_event(db, event, event_in)


@router.delete("/{event_id}")
async def delete_event_route(
    event_id: str,
    current_user=Depends(require_role(UserRole.BOOTH_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    event = await get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    await delete_event(db, event)
    return {"detail": "Event deleted"}
