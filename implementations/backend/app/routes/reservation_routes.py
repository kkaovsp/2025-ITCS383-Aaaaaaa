from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid, datetime

from ..database.db_connection import SessionLocal
from ..models.reservation import Reservation, ReservationStatus
from ..models.merchant import Merchant
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
    if user.role == "BOOTH_MANAGER":
        return db.query(Reservation).all()
    else:
        # find merchant record
        return db.query(Reservation).filter(Reservation.merchant_id == user.id).all()


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
    db.commit()
    db.refresh(new)
    return new
