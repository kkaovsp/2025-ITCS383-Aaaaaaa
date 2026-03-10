# Database connection placeholder

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from dotenv import load_dotenv

from ..models import base  # ensure models are imported for metadata

# load variables from a .env file (if present) so os.getenv() can pick them up
# Note: this requires python-dotenv which is already listed in requirements.txt
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    # create tables
    base.Base.metadata.create_all(bind=engine)
