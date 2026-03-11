from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Annotated
import uuid
import datetime
import pathlib
import re
import mimetypes

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
SLIP_REQUIRED = "Bank transfer slip is required before approval"
SLIP_NOT_FOUND = "Slip file not found"
INVALID_SLIP_FILE = "Slip must be an image or PDF file"
UNSUPPORTED_SLIP_FILE = "Stored slip is not a supported image or PDF"

UPLOAD_ROOT = pathlib.Path(__file__).resolve().parents[2] / "uploads" / "payment_slips"
ALLOWED_SLIP_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_SLIP_MIME_PREFIXES = ("image/",)
ALLOWED_SLIP_MIME_EXACT = {"application/pdf"}


def _sanitize_filename(filename: str) -> str:
    safe = pathlib.Path(filename).name
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", safe)
    return safe or "slip.bin"


def _payment_slip_dir(payment_id: str) -> pathlib.Path:
    return UPLOAD_ROOT / payment_id


def _is_allowed_slip(filename: str, content_type: str | None) -> bool:
    extension = pathlib.Path(filename).suffix.lower()
    if extension in ALLOWED_SLIP_EXTENSIONS:
        return True

    if not content_type:
        return False

    ct = content_type.lower().strip()
    if ct in ALLOWED_SLIP_MIME_EXACT:
        return True
    return any(ct.startswith(prefix) for prefix in ALLOWED_SLIP_MIME_PREFIXES)


def _resolved_slip_media_type(path: pathlib.Path) -> str | None:
    guessed = (mimetypes.guess_type(path.name)[0] or "").lower().strip()
    if guessed in ALLOWED_SLIP_MIME_EXACT:
        return guessed
    if any(guessed.startswith(prefix) for prefix in ALLOWED_SLIP_MIME_PREFIXES):
        return guessed
    return None


def _latest_slip_file(payment_id: str) -> pathlib.Path | None:
    directory = _payment_slip_dir(payment_id)
    if not directory.exists():
        return None
    files = [p for p in directory.iterdir() if p.is_file()]
    if not files:
        return None
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return files[0]


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
    role = getattr(user.role, "value", user.role)
    if role == "BOOTH_MANAGER":
        return db.query(Payment).all()

    merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
    if not merchant:
        return []

    return (
        db.query(Payment)
        .join(Payment.reservation)
        .filter(Payment.reservation.has(merchant_id=merchant.merchant_id))
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

    # For non-bank-transfer methods, the manager can review immediately.
    if req.method != "BANK_TRANSFER":
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
    responses={
        404: {"description": PAYMENT_NOT_FOUND},
        403: {"description": NOT_ALLOWED},
        400: {"description": INVALID_SLIP_FILE},
    },
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

    role = getattr(user.role, "value", user.role)
    if role != "BOOTH_MANAGER":
        merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
        if not merchant or not pay.reservation or merchant.merchant_id != pay.reservation.merchant_id:
            raise HTTPException(status_code=403, detail=NOT_ALLOWED)

    if not _is_allowed_slip(file.filename or "", file.content_type):
        raise HTTPException(status_code=400, detail=INVALID_SLIP_FILE)

    safe_name = _sanitize_filename(file.filename or "slip.bin")
    slip_dir = _payment_slip_dir(payment_id)
    slip_dir.mkdir(parents=True, exist_ok=True)

    # Keep only one active slip file per payment to avoid stale validations.
    for old_file in slip_dir.iterdir():
        if old_file.is_file():
            old_file.unlink()

    slip_path = slip_dir / safe_name
    with slip_path.open("wb") as target:
        target.write(file.file.read())

    pay.slip_url = f"/api/payments/{payment_id}/slip"

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


@router.get(
    "/payments/{payment_id}/slip",
    responses={
        404: {"description": SLIP_NOT_FOUND},
        403: {"description": NOT_ALLOWED},
        415: {"description": UNSUPPORTED_SLIP_FILE},
    },
)
def get_payment_slip(
    payment_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    download: str | None = None,
):
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()

    if not pay:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)

    role = getattr(user.role, "value", user.role)
    if role != "BOOTH_MANAGER":
        merchant = db.query(Merchant).filter(Merchant.user_id == user.id).first()
        if not merchant or not pay.reservation or merchant.merchant_id != pay.reservation.merchant_id:
            raise HTTPException(status_code=403, detail=NOT_ALLOWED)

    slip_file = _latest_slip_file(payment_id)
    if not slip_file:
        raise HTTPException(status_code=404, detail=SLIP_NOT_FOUND)

    media_type = _resolved_slip_media_type(slip_file)
    if not media_type:
        raise HTTPException(status_code=415, detail=UNSUPPORTED_SLIP_FILE)

    truthy = {"1", "true", "yes", "on"}
    force_download = str(download).strip().lower() in truthy if download is not None else False
    disposition = "attachment" if force_download else "inline"
    return FileResponse(
        path=str(slip_file),
        media_type=media_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{slip_file.name}"',
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.patch(
    "/payments/{payment_id}/approve",
    responses={
        404: {"description": PAYMENT_NOT_FOUND},
        400: {"description": SLIP_REQUIRED},
    },
)
def approve_payment(
    payment_id: str,
    user: Annotated[User, Depends(require_role(["BOOTH_MANAGER"]))],
    db: Annotated[Session, Depends(get_db)],
):
    pay = db.query(Payment).filter(Payment.payment_id == payment_id).first()

    if not pay:
        raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)

    method_val = getattr(pay.method, "value", pay.method)
    if method_val == "BANK_TRANSFER" and not pay.slip_url:
        raise HTTPException(status_code=400, detail=SLIP_REQUIRED)

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