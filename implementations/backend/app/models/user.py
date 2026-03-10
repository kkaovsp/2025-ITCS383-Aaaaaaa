import uuid
from enum import Enum as PyEnum

from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.sql import func

from .base import Base


class UserRole(str, PyEnum):
    GENERAL_USER = "GENERAL_USER"
    MERCHANT = "MERCHANT"
    BOOTH_MANAGER = "BOOTH_MANAGER"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    contact_info = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.GENERAL_USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships defined in other models
