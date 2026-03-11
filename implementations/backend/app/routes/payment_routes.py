from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Annotated
import uuid
import datetime

from ..database.db_connection import SessionLocal
from ..models.payment import Payment, PaymentStatus
from ..schemas.payment_schema import PaymentCreate
from ..services.dependencies import get_current_user, require_role
from ..models.notification import Notification, NotificationType
from ..models.user import User, UserRole
from ..models.merchant import Merchant
from ..models.reservation import Reservation, ReservationStatus
from ..models.booth import Booth, BoothStatus

router = APIRouter()

RESERVATION_NOT_FOUND = "Reservation not found"
BOOTH_NOT_FOUND = "Booth not found"
PAYMENT_NOT_FOUND = "Payment not found"
NOT_ALLOWED = "Not allowed to pay for this reservation"
INVALID_AMOUNT = "Amount must equal full booth price"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/payments")
def list_payments(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if user.role == "BOOTH_MANAGER":
        return db.query(Payment).all()

    return (
        db.query(Payment)
        .join(Payment.reservation)
        .filter(Payment.reservation.has(merchant_id=user.id))
        .all()
    )


@router.post(
    "/payments",
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": RESERVATION_NOT_FOUND},
        403: {"description": NOT_ALLOWED},
        400: {"description": INVALID_AMOUNT},
    },
)
def create_payment(
    req: PaymentCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    res = db.query(Reservation).filter(
        Reservation.reservation_id == req.reservation_id
    ).first()

    if not res:
        raise HTTPException(status_code=404, detail=RESERVATION_NOT_FOUND)

    merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()

    if not merchant or merchant.merchant_id != res.merchant_id:
        raise HTTPException(status_code=403, detail=NOT_ALLOWED)

    booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()

    if not booth:
        raise HTTPException(status_code=404, detail=BOOTH_NOT_FOUND)

    if float(req.amount) != float(getattr(booth, "price", 0)):
        raise HTTPException(status_code=400, detail=INVALID_AMOUNT)

    new = Payment(
        payment_id=str(uuid.uuid4()),
        reservation_id=req.reservation_id,
        amount=req.amount,
        method=req.method,
        payment_status=PaymentStatus.PENDING,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(new)

    res.status = ReservationStatus.WAITING_FOR_APPROVAL
    db.add(res)

    db.commit()
    db.refresh(new)

    managers = db.query(User).filter(User.role == UserRole.BOOTH_MANAGER).all()

    for m in managers:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=m.id,
            title="Payment submitted",
            message=f"Payment {new.payment_id} for reservation {new.reservation_id} requires review",
            type=NotificationType.PAYMENT,
            reference_id=new.payment_id,
            is_read=False,
            created_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(note)

    db.commit()

    return {
        "payment_id": new.payment_id,
        "reservation_id": new.reservation_id,
        "payment_status": getattr(new.payment_status, "value", new.payment_status),
    }


@router.post(
    "/payments/upload-slip",
    responses={404: {"description": PAYMENT_NOT_FOUND}},
)
def upload_slip(
    payment_id: str,
    file: Annotated[UploadFile, File(...)],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()

    if not pay:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)

    pay.slip_url = f"/files/{payment_id}/{file.filename}"

    db.commit()

    managers = db.query(User).filter(User.role == UserRole.BOOTH_MANAGER).all()

    for m in managers:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=m.id,
            title="Payment slip uploaded",
            message=f"Slip uploaded for payment {payment_id}",
            type=NotificationType.PAYMENT,
            reference_id=payment_id,
            is_read=False,
            created_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(note)

    db.commit()

    return {"msg": "slip uploaded"}


@router.patch(
    "/payments/{payment_id}/approve",
    responses={404: {"description": PAYMENT_NOT_FOUND}},
)
def approve_payment(
    payment_id: str,
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()

    if not pay:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)

    pay.payment_status = PaymentStatus.APPROVED

    res = pay.reservation

    if res:
        res.status = ReservationStatus.CONFIRMED

        booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()

        if booth:
            booth.status = BoothStatus.OCCUPIED
            db.add(booth)

    db.commit()
    db.refresh(pay)

    merchant = None

    if res:
        merchant = db.query(Merchant).filter(
            Merchant.merchant_id == res.merchant_id
        ).first()

    if merchant:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=merchant.user_id,
            title="Payment approved",
            message=f"Your payment {pay.payment_id} has been approved",
            type=NotificationType.PAYMENT,
            reference_id=pay.payment_id,
            is_read=False,
            created_at=datetime.datetime.now(datetime.timezone.utc),
        )

        db.add(note)
        db.commit()

    return {
        "payment_id": pay.payment_id,
        "reservation_id": pay.reservation_id,
        "payment_status": getattr(pay.payment_status, "value", pay.payment_status),
    }