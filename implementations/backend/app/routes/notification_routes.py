from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.db_connection import SessionLocal
from ..models.notification import Notification
from ..services.dependencies import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/notifications")
def list_notifications(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user.id).all()


@router.patch("/notifications/{notification_id}/read")
def mark_read(notification_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.notification_id == notification_id, Notification.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    note.is_read = True
    db.commit()
    return note
