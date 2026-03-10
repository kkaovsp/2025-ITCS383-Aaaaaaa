from fastapi import FastAPI

from .database.db_connection import init_db
from .routes import auth_routes, event_routes, booth_routes, reservation_routes, payment_routes, notification_routes, merchant_routes

app = FastAPI()

# initialize database tables on startup
@app.on_event("startup")
def startup_event():
    init_db()

app.include_router(auth_routes.router, prefix="/api")
app.include_router(event_routes.router, prefix="/api")
app.include_router(booth_routes.router, prefix="/api")
app.include_router(reservation_routes.router, prefix="/api")
app.include_router(payment_routes.router, prefix="/api")
app.include_router(notification_routes.router, prefix="/api")
app.include_router(merchant_routes.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Booth Organizer API"}
