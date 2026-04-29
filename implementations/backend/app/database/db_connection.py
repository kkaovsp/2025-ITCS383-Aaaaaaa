# Database connection placeholder

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

from dotenv import load_dotenv

from ..models import base  # ensure Base is available

# Import all model modules to ensure they are registered with Base.metadata
# This is required so that create_all() creates all tables
from ..models import user
from ..models import reservation
from ..models import payment
from ..models import notification
from ..models import merchant
from ..models import event
from ..models import booth

# load variables from a .env file (if present) so os.getenv() can pick them up
# Note: this requires python-dotenv which is already listed in requirements.txt
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL environment variable is not set")  # pragma: no cover

is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, echo=True)  # pragma: no cover

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    # create tables
    base.Base.metadata.create_all(bind=engine)
    # Enable foreign keys for SQLite using raw connection (SQLAlchemy 1.4 compatible)
    if is_sqlite:
        with engine.begin() as conn:
            conn.execute(text("PRAGMA foreign_keys=ON"))
