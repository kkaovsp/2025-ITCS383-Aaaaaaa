from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.orm import relationship
from .base import Base
import enum


class UserRole(str, enum.Enum):
    GENERAL_USER = "GENERAL_USER"
    MERCHANT = "MERCHANT"
    BOOTH_MANAGER = "BOOTH_MANAGER"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(100))
    contact_info = Column(String(100))
    role = Column(Enum(UserRole))
    created_at = Column(DateTime)

    merchant = relationship("Merchant", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
