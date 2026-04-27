import os
import sys
import pytest
from fastapi.testclient import TestClient

# ensure backend root is importable
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.database.db_connection import engine, SessionLocal, init_db
from app.models import base
from app.main import app


# Reset database before each test
@pytest.fixture(autouse=True)
def reset_db():
    init_db()
    db = SessionLocal()
    try:
        for table in reversed(base.Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    finally:
        db.close()
    yield


# Reset FastAPI dependency overrides after each test
@pytest.fixture(autouse=True)
def reset_overrides():
    yield
    app.dependency_overrides = {}


# -----------------------------
# ADD THESE FIXTURES
# -----------------------------

@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def app_fixture():
    return app


@pytest.fixture
def db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
