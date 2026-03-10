from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import uuid, datetime

from ..database.db_connection import SessionLocal
from ..models.payment import Payment, PaymentStatus
from ..schemas.payment_schema import PaymentCreate
from ..services.dependencies import get_current_user, require_role

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
    new = Payment(
        payment_id=str(uuid.uuid4()),
        reservation_id=req.reservation_id,
        amount=req.amount,
        method=req.method,
        payment_status=PaymentStatus.PENDING,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.post("/payments/upload-slip")
def upload_slip(payment_id: str, file: UploadFile = File(...), user=Depends(get_current_user), db: Session = Depends(get_db)):
    # for simplicity, just record a placeholder URL
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not pay:
        raise HTTPException(status_code=404, detail="Payment not found")
    pay.slip_url = f"/files/{payment_id}/{file.filename}"
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
        res.status = "CONFIRMED"
    db.commit()
    return pay
