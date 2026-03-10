from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import uuid, datetime

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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/payments")
def list_payments(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "BOOTH_MANAGER":
        return db.query(Payment).all()
    else:
        # assume merchant wants their own payments
        return db.query(Payment).join(Payment.reservation).filter(
            Payment.reservation.has(merchant_id=user.id)
        ).all()


@router.post("/payments", status_code=status.HTTP_201_CREATED)
def create_payment(req: PaymentCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    # merchants create payments
    # verify reservation exists and belongs to this merchant
    res = db.query(Reservation).filter(Reservation.reservation_id == req.reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # only the merchant who owns the reservation may create a payment
    merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
    if not merchant or merchant.merchant_id != res.merchant_id:
        raise HTTPException(status_code=403, detail="Not allowed to pay for this reservation")

    # load booth to check price
    booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
    if not booth:
        raise HTTPException(status_code=404, detail="Booth not found")

    # require full payment (no installments)
    if float(req.amount) != float(getattr(booth, 'price', 0)):
        raise HTTPException(status_code=400, detail="Amount must equal full booth price")

    new = Payment(
        payment_id=str(uuid.uuid4()),
        reservation_id=req.reservation_id,
        amount=req.amount,
        method=req.method,
        payment_status=PaymentStatus.PENDING,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new)
    # mark reservation as waiting for manager approval when merchant pays
    res.status = ReservationStatus.WAITING_FOR_APPROVAL
    db.add(res)
    db.commit()
    db.refresh(new)
    # notify managers about new payment pending
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
            created_at=datetime.datetime.utcnow(),
        )
        db.add(note)
    db.commit()
    return new


@router.post("/payments/upload-slip")
def upload_slip(payment_id: str, file: UploadFile = File(...), user=Depends(get_current_user), db: Session = Depends(get_db)):
    # for simplicity, just record a placeholder URL
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not pay:
        raise HTTPException(status_code=404, detail="Payment not found")
    pay.slip_url = f"/files/{payment_id}/{file.filename}"
    db.commit()
    # notify managers that a slip was uploaded for review
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
            created_at=datetime.datetime.utcnow(),
        )
        db.add(note)
    db.commit()
    return {"msg": "slip uploaded"}


@router.patch("/payments/{payment_id}/approve")
def approve_payment(payment_id: str, user=Depends(require_role(["BOOTH_MANAGER"])), db: Session = Depends(get_db)):
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not pay:
        raise HTTPException(status_code=404, detail="Payment not found")
    pay.payment_status = PaymentStatus.APPROVED
    # optionally update reservation status
    res = pay.reservation
    if res:
        # ensure reservation is confirmed
        res.status = ReservationStatus.CONFIRMED
        # mark booth occupied
        booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
        if booth:
            booth.status = BoothStatus.OCCUPIED
            db.add(booth)
    db.commit()
    db.refresh(pay)  # ensure we have the latest values after commit
    # notify merchant that payment approved
    res = pay.reservation
    merchant = None
    if res:
        merchant = db.query(Merchant).filter(Merchant.merchant_id == res.merchant_id).first()
    if merchant:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=merchant.user_id,
            title="Payment approved",
            message=f"Your payment {pay.payment_id} has been approved",
            type=NotificationType.PAYMENT,
            reference_id=pay.payment_id,
            is_read=False,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(note)
        db.commit()
    return pay
