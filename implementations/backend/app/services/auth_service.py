from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.user import User, UserRole
from ..models.merchant import Merchant
from ..core.security import hash_password, verify_password, create_access_token
from ..schemas.user_schema import UserCreate


async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
    # Ensure unique username
    existing = await db.execute(select(User).where(User.username == user_in.username))
    if existing.scalars().first():
        raise ValueError("Username already taken")

    user = User(
        username=user_in.username,
        password=hash_password(user_in.password),
        name=user_in.name,
        contact_info=user_in.contact_info,
        role=user_in.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    if user.role == UserRole.MERCHANT:
        merchant = Merchant(
            merchant_id=user.id,
            citizen_id=user_in.citizen_id or "",
            seller_information=user_in.seller_information or "",
            product_description=user_in.product_description or "",
            approval_status="PENDING",
        )
        db.add(merchant)
        await db.commit()
    return user


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def create_token(user: User) -> str:
    return create_access_token(subject=user.id)
