from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.event import Event
from ..schemas.event_schema import EventCreate


async def create_event(db: AsyncSession, event_in: EventCreate, created_by: str) -> Event:
    event = Event(**event_in.model_dump(), created_by=created_by)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def list_events(db: AsyncSession) -> list[Event]:
    result = await db.execute(select(Event))
    return result.scalars().all()


async def get_event(db: AsyncSession, event_id: str) -> Event | None:
    result = await db.execute(select(Event).where(Event.event_id == event_id))
    return result.scalars().first()


async def update_event(db: AsyncSession, event: Event, data: EventCreate) -> Event:
    for key, value in data.model_dump().items():
        setattr(event, key, value)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def delete_event(db: AsyncSession, event: Event) -> None:
    await db.delete(event)
    await db.commit()
