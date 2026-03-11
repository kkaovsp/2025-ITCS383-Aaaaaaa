from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
import uuid
import datetime

from ..database.db_connection import SessionLocal
from ..models.reservation import Reservation, ReservationStatus
from ..models.merchant import Merchant, ApprovalStatus
from ..models.booth import Booth, BoothStatus
from ..models.notification import Notification, NotificationType
from ..models.user import User, UserRole
from ..models.payment import Payment, PaymentStatus
from ..schemas.reservation_schema import ReservationCreate
from ..services.dependencies import get_current_user, require_role

router = APIRouter()
MERCHANT_ACCESS_REQUIRED = "Only approved merchants can access reservations"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def now_utc():
    return datetime.datetime.now(datetime.timezone.utc)


def get_approved_merchant_or_403(db: Session, user: User) -> Merchant:
    merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
    if not merchant:
        raise HTTPException(status_code=403, detail=MERCHANT_ACCESS_REQUIRED)

    status_val = getattr(merchant.approval_status, "value", merchant.approval_status)
    if status_val != getattr(ApprovalStatus.APPROVED, "value", ApprovalStatus.APPROVED):
        raise HTTPException(status_code=403, detail=MERCHANT_ACCESS_REQUIRED)

    return merchant


@router.get(
    "/reservations",
    responses={
        403: {"description": MERCHANT_ACCESS_REQUIRED}
    },
)
def list_reservations(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    def enrich(res):
        booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
        merchant = db.query(Merchant).filter(Merchant.merchant_id == res.merchant_id).first()
        latest_payment = (
            db.query(Payment)
            .filter(Payment.reservation_id == res.reservation_id)
            .order_by(Payment.created_at.desc())
            .first()
        )

        return {
            "reservation_id": res.reservation_id,
            "booth_id": res.booth_id,
            "reservation_type": getattr(res.reservation_type, "value", res.reservation_type),
            "status": getattr(res.status, "value", res.status),
            "created_at": res.created_at.isoformat() if res.created_at else None,
            "booth": {
                "booth_number": getattr(booth, "booth_number", None),
                "price": float(getattr(booth, "price", 0)) if booth else None,
            },
            "merchant": {
                "merchant_id": getattr(merchant, "merchant_id", None),
                "user_id": getattr(merchant, "user_id", None),
            },
            "payment": {
                "payment_id": getattr(latest_payment, "payment_id", None),
                "amount": float(getattr(latest_payment, "amount", 0)) if latest_payment else None,
                "method": getattr(latest_payment, "method", None),
                "payment_status": getattr(getattr(latest_payment, "payment_status", None), "value", getattr(latest_payment, "payment_status", None)) if latest_payment else None,
                "slip_url": getattr(latest_payment, "slip_url", None),
                "created_at": latest_payment.created_at.isoformat() if latest_payment and latest_payment.created_at else None,
            },
        }

    if getattr(user.role, "value", user.role) == "BOOTH_MANAGER":
        rows = db.query(Reservation).all()
        return [enrich(r) for r in rows]

    role = getattr(user.role, "value", user.role)
    if role != "MERCHANT":
        raise HTTPException(status_code=403, detail=MERCHANT_ACCESS_REQUIRED)

    merchant = get_approved_merchant_or_403(db, user)

    rows = db.query(Reservation).filter(
        Reservation.merchant_id == merchant.merchant_id
    ).all()

    return [enrich(r) for r in rows]


@router.post(
    "/reservations",
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Booth already reserved or merchant profile missing"},
        403: {"description": "Only merchants can reserve booths"},
    },
)
def create_reservation(
    req: ReservationCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    role = getattr(user.role, "value", user.role)
    if role != "MERCHANT":
        raise HTTPException(status_code=403, detail="Only merchants can reserve booths")

    existing = db.query(Reservation).filter(
        Reservation.booth_id == req.booth_id,
        Reservation.status != ReservationStatus.CANCELLED,
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Booth already reserved")

    merchant = get_approved_merchant_or_403(db, user)

    new = Reservation(
        reservation_id=str(uuid.uuid4()),
        booth_id=req.booth_id,
        merchant_id=merchant.merchant_id,
        reservation_type=req.reservation_type,
        status=ReservationStatus.PENDING_PAYMENT,
        created_at=now_utc(),
    )

    db.add(new)

    booth = db.query(Booth).filter(Booth.booth_id == req.booth_id).first()
    if booth:
        booth.status = BoothStatus.RESERVED
        db.add(booth)

    db.commit()
    db.refresh(new)

    managers = db.query(User).filter(User.role == UserRole.BOOTH_MANAGER).all()

    for m in managers:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=m.id,
            title="New reservation",
            message=f"Reservation {new.reservation_id} for booth {new.booth_id}",
            type=NotificationType.RESERVATION,
            reference_id=new.reservation_id,
            is_read=False,
            created_at=now_utc(),
        )
        db.add(note)

    db.commit()

    return {
        "reservation_id": new.reservation_id,
        "status": getattr(new.status, "value", new.status),
    }


@router.patch(
    "/reservations/{reservation_id}/confirm",
    responses={404: {"description": "Reservation not found"}},
)
def confirm_reservation(
    reservation_id: str,
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):

    res = db.query(Reservation).filter(
        Reservation.reservation_id == reservation_id
    ).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    res.status = ReservationStatus.CONFIRMED

    booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
    if booth:
        booth.status = BoothStatus.OCCUPIED
        db.add(booth)

    db.commit()
    db.refresh(res)

    return {"msg": "reservation confirmed", "reservation_id": res.reservation_id}


def check_cancel_permissions(user, db, res):
    role = getattr(user.role, "value", user.role)

    if role == "BOOTH_MANAGER":
        return

    if role == "MERCHANT":
        merchant = get_approved_merchant_or_403(db, user)

        if not merchant or merchant.merchant_id != res.merchant_id:
            raise HTTPException(status_code=403, detail="Not allowed to cancel this reservation")
        return

    raise HTTPException(status_code=403, detail="Not allowed to cancel this reservation")


def validate_payment_cancellation(payments):
    for p in payments:
        if getattr(p.payment_status, "value", p.payment_status) == getattr(
            PaymentStatus.APPROVED, "value", PaymentStatus.APPROVED
        ):
            raise HTTPException(
                status_code=400,
                detail="Cannot cancel reservation with approved payment",
            )


def reject_pending_payments(db, payments):
    for p in payments:
        if getattr(p.payment_status, "value", p.payment_status) == getattr(
            PaymentStatus.PENDING, "value", PaymentStatus.PENDING
        ):
            p.payment_status = PaymentStatus.REJECTED
            db.add(p)


@router.patch(
    "/reservations/{reservation_id}/cancel",
    responses={
        400: {"description": "Invalid cancellation"},
        403: {"description": "Not allowed to cancel"},
        404: {"description": "Reservation not found"},
    },
)
def cancel_reservation(
    reservation_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):

    res = db.query(Reservation).filter(
        Reservation.reservation_id == reservation_id
    ).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if getattr(res.status, "value", res.status) == getattr(
        ReservationStatus.CONFIRMED, "value", ReservationStatus.CONFIRMED
    ):
        raise HTTPException(status_code=400, detail="Cannot cancel a confirmed reservation")

    check_cancel_permissions(user, db, res)

    payments = db.query(Payment).filter(
        Payment.reservation_id == reservation_id
    ).all()

    validate_payment_cancellation(payments)

    reject_pending_payments(db, payments)

    res.status = ReservationStatus.CANCELLED

    booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
    if booth:
        booth.status = BoothStatus.AVAILABLE
        db.add(booth)

    db.commit()

    merchant_rec = db.query(Merchant).filter(
        Merchant.merchant_id == res.merchant_id
    ).first()

    if merchant_rec:
        db.add(
            Notification(
                notification_id=str(uuid.uuid4()),
                user_id=merchant_rec.user_id,
                title="Reservation cancelled",
                message=f"Reservation {res.reservation_id} was cancelled",
                type=NotificationType.RESERVATION,
                reference_id=res.reservation_id,
                is_read=False,
                created_at=now_utc(),
            )
        )

    managers = db.query(User).filter(User.role == UserRole.BOOTH_MANAGER).all()

    for m in managers:
        db.add(
            Notification(
                notification_id=str(uuid.uuid4()),
                user_id=m.id,
                title="Reservation cancelled",
                message=f"Reservation {res.reservation_id} was cancelled",
                type=NotificationType.RESERVATION,
                reference_id=res.reservation_id,
                is_read=False,
                created_at=now_utc(),
            )
        )

    db.commit()

    return {"msg": "reservation cancelled", "reservation_id": res.reservation_id}