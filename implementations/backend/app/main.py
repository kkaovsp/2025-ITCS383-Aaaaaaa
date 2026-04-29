from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from dotenv import load_dotenv
from .database.db_connection import init_db
from .routes import auth_routes, event_routes, booth_routes, reservation_routes, payment_routes, notification_routes, merchant_routes

load_dotenv()

app = FastAPI()

cors_origins_str = os.getenv("CORS_ORIGINS", "")
if cors_origins_str:
    cors_origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]  # pragma: no cover
else:
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
def health():
    return {"status": "ok"}
