"""API route package"""

from .auth_routes import router as auth_router  # noqa: F401
from .event_routes import router as event_router  # noqa: F401
from .booth_routes import router as booth_router  # noqa: F401
from .reservation_routes import router as reservation_router  # noqa: F401
from .payment_routes import router as payment_router  # noqa: F401
from .notification_routes import router as notification_router  # noqa: F401
