from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from ..database.db_connection import SessionLocal
from ..models.notification import Notification
from ..services.dependencies import get_current_user
from ..models.user import User

router = APIRouter()

NOTIFICATION_NOT_FOUND = "Notification not found"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/notifications")
def list_notifications(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return db.query(Notification).filter(Notification.user_id == user.id).all()


@router.patch(
    "/notifications/{notification_id}/read",
    responses={404: {"description": NOTIFICATION_NOT_FOUND}},
)
def mark_read(
    notification_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    note = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.user_id == user.id,
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail=NOTIFICATION_NOT_FOUND)

    note.is_read = True
    db.commit()
    db.refresh(note)

    return note