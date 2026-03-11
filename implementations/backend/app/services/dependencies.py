from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from .auth_service import decode_access_token
import logging
logger = logging.getLogger("uvicorn.error")
from ..database.db_connection import SessionLocal
from ..models.user import User


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(request: Request, db: Session = Depends(get_db)):
    # Accept token from Authorization header `Bearer <token>` or HttpOnly cookie `access_token`.
    auth = request.headers.get("authorization")
    token = None
    if auth and auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1]
    else:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_role(roles: list[str]):
    def role_checker(user = Depends(get_current_user)):
        # user.role may be an Enum (UserRole) or a plain string depending on storage.
        role_value = getattr(user.role, 'value', user.role)
        # log for debugging role mismatches
        logger.debug(f"require_role: user.id={getattr(user,'id',None)} role={role_value} allowed={roles}")
        if role_value not in roles:
            logger.warning(f"forbidden: user {getattr(user,'id',None)} role={role_value} not in {roles}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Operation not permitted")
        return user
    return role_checker
