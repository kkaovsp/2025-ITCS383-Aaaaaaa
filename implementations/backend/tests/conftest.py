import os
import sys

# ensure the project root (backend) is on PYTHONPATH so that "app" can be imported
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.database.db_connection import engine, SessionLocal
from app.models import base

import pytest

# Automatically wipe all data from tables before each test to ensure a
# clean slate.  We avoid dropping tables because the MySQL user may not have
# DROP privileges; deleting rows only requires basic DELETE rights.
# The loop iterates in reverse order to respect foreign key dependencies.
@pytest.fixture(autouse=True)
def reset_db():
    db = SessionLocal()
    try:
        for table in reversed(base.Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    finally:
        db.close()
    yield
