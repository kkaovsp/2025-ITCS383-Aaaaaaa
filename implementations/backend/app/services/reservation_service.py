from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.reservation import Reservation, ReservationStatus
from ..models.booth import Booth, BoothStatus
from ..schemas.reservation_schema import ReservationCreate


async def create_reservation(db: AsyncSession, reservation_in: ReservationCreate) -> Reservation:
    # Prevent double booking: booth must be available
    booth_result = await db.execute(select(Booth).where(Booth.booth_id == reservation_in.booth_id))
    booth = booth_result.scalars().first()
    if not booth:
        raise ValueError("Booth not found")
    if booth.status != BoothStatus.AVAILABLE:
        raise ValueError("Booth is not available")

    reservation = Reservation(**reservation_in.model_dump())
    db.add(reservation)
    booth.status = BoothStatus.RESERVED
    db.add(booth)
    await db.commit()
    await db.refresh(reservation)
    return reservation


async def list_reservations_for_user(db: AsyncSession, merchant_id: str) -> list[Reservation]:
    result = await db.execute(select(Reservation).where(Reservation.merchant_id == merchant_id))
    return result.scalars().all()


async def get_reservation(db: AsyncSession, reservation_id: str) -> Reservation | None:
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == reservation_id))
    return result.scalars().first()


async def confirm_reservation(db: AsyncSession, reservation: Reservation) -> Reservation:
    reservation.status = ReservationStatus.CONFIRMED
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)
    return reservation
