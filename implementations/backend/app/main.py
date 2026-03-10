from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.db_connection import engine, Base
from .routes import (
    auth_routes,
    event_routes,
    booth_routes,
    reservation_routes,
    payment_routes,
    notification_routes,
    merchant_routes,
)


def create_app() -> FastAPI:
    app = FastAPI(title="Booth Organizer System")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_routes.router)
    app.include_router(event_routes.router)
    app.include_router(booth_routes.router)
    app.include_router(reservation_routes.router)
    app.include_router(payment_routes.router)
    app.include_router(notification_routes.router)
    app.include_router(merchant_routes.router)

    @app.on_event("startup")
    async def on_startup():
        # Create DB tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    return app


app = create_app()
