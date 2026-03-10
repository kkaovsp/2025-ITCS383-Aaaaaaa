from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.booth import Booth
from ..schemas.booth_schema import BoothCreate


async def create_booth(db: AsyncSession, booth_in: BoothCreate) -> Booth:
    booth = Booth(**booth_in.model_dump())
    db.add(booth)
    await db.commit()
    await db.refresh(booth)
    return booth


async def list_booths_for_event(db: AsyncSession, event_id: str) -> list[Booth]:
    result = await db.execute(select(Booth).where(Booth.event_id == event_id))
    return result.scalars().all()


async def get_booth(db: AsyncSession, booth_id: str) -> Booth | None:
    result = await db.execute(select(Booth).where(Booth.booth_id == booth_id))
    return result.scalars().first()


async def update_booth(db: AsyncSession, booth: Booth, data: BoothCreate) -> Booth:
    for key, value in data.model_dump().items():
        setattr(booth, key, value)
    db.add(booth)
    await db.commit()
    await db.refresh(booth)
    return booth


async def delete_booth(db: AsyncSession, booth: Booth) -> None:
    await db.delete(booth)
    await db.commit()
