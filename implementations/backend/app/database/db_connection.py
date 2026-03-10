# Database connection placeholder

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from ..models import base  # ensure models are imported for metadata

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    # create tables
    base.Base.metadata.create_all(bind=engine)
