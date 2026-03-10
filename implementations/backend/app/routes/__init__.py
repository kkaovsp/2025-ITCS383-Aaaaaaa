from .auth_routes import router as auth_router
from .event_routes import router as event_router
from .booth_routes import router as booth_router
from .reservation_routes import router as reservation_router
from .payment_routes import router as payment_router
from .notification_routes import router as notification_router

# re-export for main
router = None
