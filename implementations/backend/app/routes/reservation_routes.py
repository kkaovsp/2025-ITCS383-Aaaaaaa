from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid, datetime

from ..database.db_connection import SessionLocal
from ..models.reservation import Reservation, ReservationStatus
from ..models.merchant import Merchant
from ..models.booth import Booth, BoothStatus
from ..models.notification import Notification, NotificationType
from ..models.user import User, UserRole
from ..models.payment import Payment, PaymentStatus
from ..schemas.reservation_schema import ReservationCreate
from ..services.dependencies import get_current_user, require_role

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/reservations")
def list_reservations(user=Depends(get_current_user), db: Session = Depends(get_db)):
    # Return reservations with attached booth and merchant minimal info for UI
    def enrich(res):
        booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
        merchant = db.query(Merchant).filter(Merchant.merchant_id == res.merchant_id).first()
        return {
            "reservation_id": res.reservation_id,
            "booth_id": res.booth_id,
            "reservation_type": getattr(res.reservation_type, 'value', res.reservation_type),
            "status": getattr(res.status, 'value', res.status),
            "created_at": res.created_at.isoformat() if res.created_at else None,
            "booth": {
                "booth_number": getattr(booth, 'booth_number', None),
                "price": float(getattr(booth, 'price', 0)) if booth else None,
            },
            "merchant": {
                "merchant_id": getattr(merchant, 'merchant_id', None),
                "user_id": getattr(merchant, 'user_id', None),
            }
        }

    if getattr(user.role, 'value', user.role) == "BOOTH_MANAGER":
        rows = db.query(Reservation).all()
        return [enrich(r) for r in rows]
    else:
        # find merchant record for this user
        merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
        if not merchant:
            return []
        rows = db.query(Reservation).filter(Reservation.merchant_id == merchant.merchant_id).all()
        return [enrich(r) for r in rows]


@router.post("/reservations", status_code=status.HTTP_201_CREATED)
def create_reservation(req: ReservationCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    # only merchants can reserve
    if user.role != "MERCHANT":
        raise HTTPException(status_code=403, detail="Only merchants can reserve booths")
    # prevent double booking
    existing = db.query(Reservation).filter(
        Reservation.booth_id == req.booth_id,
        Reservation.status != ReservationStatus.CANCELLED
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Booth already reserved")
    # determine the merchant record tied to this user
    merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
    if not merchant:
        raise HTTPException(status_code=400, detail="Merchant profile not found")
    new = Reservation(
        reservation_id=str(uuid.uuid4()),
        booth_id=req.booth_id,
        merchant_id=merchant.merchant_id,
        reservation_type=req.reservation_type,
        status=ReservationStatus.PENDING_PAYMENT,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new)
    # mark booth as reserved
    booth = db.query(Booth).filter(Booth.booth_id == req.booth_id).first()
    if booth:
        booth.status = BoothStatus.RESERVED
        db.add(booth)
    db.commit()
    db.refresh(new)
    # notify all booth managers about the new reservation
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
            created_at=datetime.datetime.utcnow(),
        )
        db.add(note)
    db.commit()
    return new


@router.patch('/reservations/{reservation_id}/confirm')
def confirm_reservation(reservation_id: str, user=Depends(require_role(["BOOTH_MANAGER"])) , db: Session = Depends(get_db)):
    res = db.query(Reservation).filter(Reservation.reservation_id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    res.status = ReservationStatus.CONFIRMED
    # mark booth occupied
    booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
    if booth:
        booth.status = BoothStatus.OCCUPIED
        db.add(booth)
    db.commit()
    db.refresh(res)
    return {"msg": "reservation confirmed", "reservation_id": res.reservation_id}


@router.patch('/reservations/{reservation_id}/cancel')
def cancel_reservation(reservation_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    res = db.query(Reservation).filter(Reservation.reservation_id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # do not allow canceling a confirmed reservation
    if getattr(res.status, 'value', res.status) == getattr(ReservationStatus.CONFIRMED, 'value', ReservationStatus.CONFIRMED):
        raise HTTPException(status_code=400, detail="Cannot cancel a confirmed reservation")

    # authorization: merchant who owns it or booth manager
    if getattr(user.role, 'value', user.role) == 'BOOTH_MANAGER':
        allowed = True
    elif getattr(user.role, 'value', user.role) == 'MERCHANT':
        merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
        if not merchant or merchant.merchant_id != res.merchant_id:
            raise HTTPException(status_code=403, detail="Not allowed to cancel this reservation")
        allowed = True
    else:
        raise HTTPException(status_code=403, detail="Not allowed to cancel this reservation")

    # if any approved payments exist, disallow cancellation
    payments = db.query(Payment).filter(Payment.reservation_id == reservation_id).all()
    for p in payments:
        if getattr(p.payment_status, 'value', p.payment_status) == getattr(PaymentStatus.APPROVED, 'value', PaymentStatus.APPROVED):
            raise HTTPException(status_code=400, detail="Cannot cancel reservation with approved payment")

    # mark any pending payments as rejected
    for p in payments:
        if getattr(p.payment_status, 'value', p.payment_status) == getattr(PaymentStatus.PENDING, 'value', PaymentStatus.PENDING):
            p.payment_status = PaymentStatus.REJECTED
            db.add(p)

    # set reservation cancelled and free booth
    res.status = ReservationStatus.CANCELLED
    booth = db.query(Booth).filter(Booth.booth_id == res.booth_id).first()
    if booth:
        booth.status = BoothStatus.AVAILABLE
        db.add(booth)

    db.commit()

    # notify merchant (if manager cancelled) and managers
    merchant_rec = db.query(Merchant).filter(Merchant.merchant_id == res.merchant_id).first()
    if merchant_rec:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=merchant_rec.user_id,
            title="Reservation cancelled",
            message=f"Reservation {res.reservation_id} was cancelled",
            type=NotificationType.RESERVATION,
            reference_id=res.reservation_id,
            is_read=False,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(note)
    managers = db.query(User).filter(User.role == UserRole.BOOTH_MANAGER).all()
    for m in managers:
        note = Notification(
            notification_id=str(uuid.uuid4()),
            user_id=m.id,
            title="Reservation cancelled",
            message=f"Reservation {res.reservation_id} was cancelled",
            type=NotificationType.RESERVATION,
            reference_id=res.reservation_id,
            is_read=False,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(note)
    db.commit()

    return {"msg": "reservation cancelled", "reservation_id": res.reservation_id}
