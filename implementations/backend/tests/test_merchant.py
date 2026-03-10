from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_merchant_approval():
    # register merchant
    client.post("/api/auth/register", json={
        "username": "merch3",
        "password": "pass",
        "name": "Merch3",
        "contact_info": "m3@example.com",
        "role": "MERCHANT",
        "citizen_id": "111",
        "product_description": "prod",
    })
    # login as manager
    client.post("/api/auth/register", json={
        "username": "mgr5",
        "password": "pass",
        "name": "Mgr5",
        "contact_info": "mgr5@example.com",
        "role": "BOOTH_MANAGER",
    })
    mgr_token = client.post("/api/auth/login", data={"username": "mgr5", "password": "pass"}).json()["access_token"]
    # try approve merchant
    # need merchant id; query via merchants? we don't have list endpoint
    # simply fetch via db using client side? Instead call get merchant by id
    # we don't know merchant_id from registration. we can list reservations or use direct query by creating session
    from app.database.db_connection import SessionLocal
    from app.models.merchant import Merchant
    db = SessionLocal()
    merch = db.query(Merchant).filter(Merchant.user_id != None).order_by(Merchant.merchant_id.desc()).first()
    merchant_id = merch.merchant_id
    db.close()

    resp = client.patch(
        f"/api/merchants/{merchant_id}/approve",
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["approval_status"] == "APPROVED"
