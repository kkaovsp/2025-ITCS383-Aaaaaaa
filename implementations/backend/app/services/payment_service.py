from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.payment import Payment, PaymentStatus
from ..models.reservation import Reservation, ReservationStatus
from ..schemas.payment_schema import PaymentCreate


async def create_payment(db: AsyncSession, payment_in: PaymentCreate) -> Payment:
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == payment_in.reservation_id))
    reservation = result.scalars().first()
    if not reservation:
        raise ValueError("Reservation not found")

    payment = Payment(**payment_in.model_dump())
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


async def approve_payment(db: AsyncSession, payment_id: str) -> Payment:
    result = await db.execute(select(Payment).where(Payment.payment_id == payment_id))
    payment = result.scalars().first()
    if not payment:
        raise ValueError("Payment not found")

    payment.payment_status = PaymentStatus.APPROVED
    db.add(payment)

    # Confirm reservation once payment approved
    reservation = payment.reservation
    if reservation:
        reservation.status = ReservationStatus.CONFIRMED
        db.add(reservation)

    await db.commit()
    await db.refresh(payment)
    return payment
