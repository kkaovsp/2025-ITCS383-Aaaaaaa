from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_MERCHANT_USERNAME = "merch3"
TEST_MERCHANT_PASSWORD = "test_merchant_password_123"

TEST_MANAGER_USERNAME = "mgr5"
TEST_MANAGER_PASSWORD = "test_manager_password_123"


def test_merchant_approval():
    # register merchant
    client.post("/api/auth/register", json={
        "username": TEST_MERCHANT_USERNAME,
        "password": TEST_MERCHANT_PASSWORD,
        "name": "Merch3",
        "contact_info": "m3@example.com",
        "role": "MERCHANT",
        "citizen_id": "111",
        "product_description": "prod",
    })

    # register manager
    client.post("/api/auth/register", json={
        "username": TEST_MANAGER_USERNAME,
        "password": TEST_MANAGER_PASSWORD,
        "name": "Mgr5",
        "contact_info": "mgr5@example.com",
        "role": "BOOTH_MANAGER",
    })

    mgr_token = client.post(
        "/api/auth/login",
        data={
            "username": TEST_MANAGER_USERNAME,
            "password": TEST_MANAGER_PASSWORD
        }
    ).json()["access_token"]

    from app.database.db_connection import SessionLocal
    from app.models.merchant import Merchant

    db = SessionLocal()
    merch = db.query(Merchant).first()
    merchant_id = merch.merchant_id
    db.close()

    resp = client.patch(
        f"/api/merchants/{merchant_id}/approve",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )

    assert resp.status_code == 200
    assert resp.json()["approval_status"] == "APPROVED"


def test_get_merchant_routes():
    from app.database.db_connection import SessionLocal
    from app.services.dependencies import get_current_user
    from app.models.merchant import Merchant
    from app.models.user import User

    db = SessionLocal()

    user_id = "11111111-1111-1111-1111-111111111111"

    user = User(
        id=user_id,
        username="u1",
        password="testpass",
        name="User",
        contact_info="u1@test.com",
        role="MERCHANT"
    )

    merchant = Merchant(
        merchant_id="m1",
        user_id=user_id,
        approval_status="APPROVED"
    )

    db.add(user)
    db.add(merchant)
    db.commit()

    class DummyUser:
        id = user_id
        role = "MERCHANT"

    app.dependency_overrides[get_current_user] = lambda: DummyUser()

    resp = client.get("/api/merchants/m1")

    assert resp.status_code == 200

    app.dependency_overrides.clear()

def test_get_merchant_not_found(client, app_fixture):
    from app.services.dependencies import get_current_user

    class DummyUser:
        id = "u1"
        role = "MERCHANT"

    app_fixture.dependency_overrides[get_current_user] = lambda: DummyUser()

    resp = client.get("/api/merchants/does_not_exist")

    assert resp.status_code == 404

def test_get_merchant_forbidden(client, app_fixture, db):
    from app.services.dependencies import get_current_user
    from app.models.merchant import Merchant
    from app.models.user import User

    user1 = User(
        id="user1",
        username="user1",
        password="pass",
        name="User1",
        contact_info="u1@test.com",
        role="MERCHANT"
    )

    user2 = User(
        id="user2",
        username="user2",
        password="pass",
        name="User2",
        contact_info="u2@test.com",
        role="MERCHANT"
    )

    merchant = Merchant(
        merchant_id="m_forbidden",
        user_id="user1",
        approval_status="APPROVED"
    )

    db.add_all([user1, user2, merchant])
    db.commit()

    class DummyUser:
        id = "user2"
        role = "MERCHANT"

    app_fixture.dependency_overrides[get_current_user] = lambda: DummyUser()

    resp = client.get("/api/merchants/m_forbidden")

    assert resp.status_code == 403

def test_reject_merchant(client):
    # register merchant
    client.post("/api/auth/register", json={
        "username": "reject_merch",
        "password": "pass",
        "name": "Reject Merch",
        "contact_info": "rm@test.com",
        "role": "MERCHANT",
        "citizen_id": "123",
        "product_description": "prod"
    })

    # register manager
    client.post("/api/auth/register", json={
        "username": "reject_mgr",
        "password": "pass",
        "name": "Mgr",
        "contact_info": "mgr@test.com",
        "role": "BOOTH_MANAGER"
    })

    mgr_token = client.post(
        "/api/auth/login",
        data={"username": "reject_mgr", "password": "pass"}
    ).json()["access_token"]

    from app.database.db_connection import SessionLocal
    from app.models.merchant import Merchant

    db = SessionLocal()
    merch = db.query(Merchant).first()
    merchant_id = merch.merchant_id
    db.close()

    resp = client.patch(
        f"/api/merchants/{merchant_id}/reject",
        headers={"Authorization": f"Bearer {mgr_token}"}
    )

    assert resp.status_code == 200


def test_set_merchant_status(client, app_fixture, db):
    from app.services.dependencies import get_current_user
    from app.models.user import User
    from app.models.merchant import Merchant

    user = User(
        id="u_status",
        username="status",
        password="pass",
        name="User",
        contact_info="s@test.com",
        role="GENERAL_USER"
    )

    merchant = Merchant(
        merchant_id="m_status",
        user_id="u_status",
        approval_status="PENDING"
    )

    db.add_all([user, merchant])
    db.commit()

    class DummyUser:
        id = "mgr"
        role = "BOOTH_MANAGER"

    app_fixture.dependency_overrides[get_current_user] = lambda: DummyUser()

    resp = client.patch(
        "/api/merchants/m_status/status",
        json={"status_value": "APPROVED"}
    )

    assert resp.status_code == 200

def test_update_merchant(client, app_fixture, db):
    from app.services.dependencies import get_current_user
    from app.models.user import User
    from app.models.merchant import Merchant

    user = User(
        id="u_update",
        username="update",
        password="pass",
        name="User",
        contact_info="u@test.com",
        role="MERCHANT"
    )

    merchant = Merchant(
        merchant_id="m_update",
        user_id="u_update",
        approval_status="APPROVED"
    )

    db.add_all([user, merchant])
    db.commit()

    class DummyUser:
        id = "u_update"
        role = "MERCHANT"

    app_fixture.dependency_overrides[get_current_user] = lambda: DummyUser()

    resp = client.patch(
        "/api/merchants/m_update",
        params={
            "seller_information": "info",
            "product_description": "product"
        }
    )

    assert resp.status_code == 200

def test_list_users(client, db):
    from app.models.user import User

    user = User(
        id="u_list",
        username="list",
        password="pass",
        name="List User",
        contact_info="list@test.com",
        role="GENERAL_USER"
    )

    db.add(user)
    db.commit()

    resp = client.get("/api/users")

    assert resp.status_code == 200