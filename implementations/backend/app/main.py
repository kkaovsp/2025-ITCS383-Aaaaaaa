from fastapi import FastAPI, Response, Request
from .database.db_connection import init_db
from .routes import auth_routes, event_routes, booth_routes, reservation_routes, payment_routes, notification_routes, merchant_routes

app = FastAPI()


# Simple development CORS middleware that echoes the request Origin and
# allows credentials. This is suitable for Codespaces/dev previews only;
# do not use this in production.
@app.middleware("http")
async def dev_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    # Handle preflight
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
            "Access-Control-Allow-Headers": "Authorization,Content-Type",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "600",
        }
        return Response(status_code=200, headers=headers)

    response = await call_next(request)
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

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