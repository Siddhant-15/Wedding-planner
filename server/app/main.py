# app/main.py

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG / DB
# ─────────────────────────────────────────────────────────────────────────────
from app.core.config import settings

from app.infrastructure.db.session import (
    startup_db,
    shutdown_db,
    engine,
)

# ─────────────────────────────────────────────────────────────────────────────
# EXISTING ROUTERS
# ─────────────────────────────────────────────────────────────────────────────
from app.routers.auth import AuthRouter
from app.routers.Customer.customer_services import router as customerservicerouter
from app.routers.Vendor.vendor_onboarding import vendorrouter
from app.routers.review.customer_reviews import Reviewrouter
from app.routers.Customer.wishlist_routes import router as wishlistrouter
from app.routers.notification.notification import NotificationRouter
from app.routers.notification.websocket import (
    router as notification_ws_router,
)
from app.routers.Vendor.availability_routes import (
    router as availability_router,
)
from app.routers.Customer.lead_routes import (
    router as LeadRouter,
)
from app.routers.Vendor.vendor_leads_routes import (
    router as vendor_leads_router,
)
from app.routers.review.review_routes import (
    router as ReviewRouter,
)

# OLD vendor services router
# from app.routers.Vendor.vendor_services import (
#     router as legacy_vendor_services_router,
# )

# ─────────────────────────────────────────────────────────────────────────────
# NEW V2 ROUTERS
# ─────────────────────────────────────────────────────────────────────────────
from app.routers.Vendor.vendor_services import router as VendorCreateService
from app.routers.Admin.moderation import router as admin_moderation

# ─────────────────────────────────────────────────────────────────────────────
# CUSTOM MIDDLEWARE
# ─────────────────────────────────────────────────────────────────────────────
from app.core.middleware.idempotency import (
    IdempotencyMiddleware,
)
from app.core.middleware.rate_limit import (
    RateLimitMiddleware,
)
from app.core.middleware.logging import (
    RequestLoggingMiddleware,
)

# ─────────────────────────────────────────────────────────────────────────────
# EXCEPTIONS
# ─────────────────────────────────────────────────────────────────────────────
from app.core.exceptions import (
    AppError,
    app_error_handler,
)

# ─────────────────────────────────────────────────────────────────────────────
# TELEMETRY / TRACING
# ─────────────────────────────────────────────────────────────────────────────
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import (
    FastAPIInstrumentor,
)
from opentelemetry.instrumentation.sqlalchemy import (
    SQLAlchemyInstrumentor,
)
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter,
)
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
)

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# TRACING SETUP
# ─────────────────────────────────────────────────────────────────────────────
def setup_tracing(app: FastAPI) -> None:
    """
    OpenTelemetry distributed tracing setup
    """

    if not settings.OTEL_ENDPOINT:
        logger.warning(
            "OTEL_ENDPOINT not configured. Tracing disabled."
        )
        return

    provider = TracerProvider()

    provider.add_span_processor(
        BatchSpanProcessor(
            OTLPSpanExporter(
                endpoint=settings.OTEL_ENDPOINT,
            )
        )
    )

    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)

    SQLAlchemyInstrumentor().instrument(
        engine=engine.sync_engine
        if hasattr(engine, "sync_engine")
        else engine
    )

    logger.info("OpenTelemetry tracing initialized")

# ─────────────────────────────────────────────────────────────────────────────
# APP LIFESPAN
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncGenerator[None, None]:

    logger.info(
        "Application startup - initializing services"
    )

    await startup_db()

    logger.info("Database initialized successfully")

    yield

    logger.info(
        "Application shutdown - closing resources"
    )

    await shutdown_db()

    logger.info("Application shutdown completed")

# ─────────────────────────────────────────────────────────────────────────────
# APP FACTORY
# ─────────────────────────────────────────────────────────────────────────────
def create_app() -> FastAPI:

    app = FastAPI(
        title="Wedding Marketplace API",
        description="Scalable backend for wedding marketplace platform",
        version="2.0.0",
        docs_url=(
            "/docs"
            if settings.ENVIRONMENT != "production"
            else None
        ),
        redoc_url=None,
        lifespan=lifespan,
        debug=settings.DEBUG,
    )

    # ─────────────────────────────────────────────────────────────────────────
    # MIDDLEWARE
    # ORDER MATTERS
    # ─────────────────────────────────────────────────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)

    app.add_middleware(RateLimitMiddleware)

    app.add_middleware(IdempotencyMiddleware)

    # ─────────────────────────────────────────────────────────────────────────
    # CORS
    # ─────────────────────────────────────────────────────────────────────────
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # "https://your-production-frontend.com",
    ]

    if settings.ENVIRONMENT == "development":
        allowed_origins.append("*")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Idempotency-Key",
        ],
        expose_headers=[
            "X-Total-Count",
        ],
    )

    # ─────────────────────────────────────────────────────────────────────────
    # TELEMETRY
    # ─────────────────────────────────────────────────────────────────────────
    setup_tracing(app)

    # ─────────────────────────────────────────────────────────────────────────
    # EXCEPTION HANDLERS
    # ─────────────────────────────────────────────────────────────────────────
    app.add_exception_handler(
        AppError,
        app_error_handler,
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ):

        errors = exc.errors()

        serializable_errors = []

        for error in errors:
            serializable_errors.append(
                {
                    "type": error.get("type"),
                    "loc": list(
                        error.get("loc", [])
                    ),
                    "msg": str(
                        error.get("msg", "")
                    ),
                    "input": (
                        str(error.get("input"))
                        if error.get("input")
                        is not None
                        else None
                    ),
                }
            )

        logger.warning(
            f"Validation error: {serializable_errors}"
        )

        return JSONResponse(
            status_code=422,
            content={
                "detail": serializable_errors,
                "message": "Validation failed",
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(
        request: Request,
        exc: SQLAlchemyError,
    ):

        logger.error(
            f"Database error: {exc}",
            exc_info=True,
        )

        return JSONResponse(
            status_code=500,
            content={
                "detail": (
                    "Database operation failed. "
                    "Please try again later."
                )
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request,
        exc: Exception,
    ):

        logger.exception(
            f"Unhandled exception: {exc}"
        )

        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
            },
        )

    # ─────────────────────────────────────────────────────────────────────────
    # LEGACY ROUTERS
    # KEEP DURING MIGRATION
    # ─────────────────────────────────────────────────────────────────────────
    app.include_router(
        AuthRouter,
        prefix=settings.API_V1_STR,
        tags=["auth"],
    )

    app.include_router(
        customerservicerouter,
        prefix=settings.API_V1_STR,
        tags=["customer_services"],
    )

    app.include_router(
        wishlistrouter,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        vendorrouter,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        Reviewrouter,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        LeadRouter,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        ReviewRouter,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        vendor_leads_router,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        availability_router,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        notification_ws_router,
        prefix=settings.API_V1_STR,
    )

    app.include_router(
        NotificationRouter,
        prefix=settings.API_V1_STR,
    )

    # ─────────────────────────────────────────────────────────────────────────
    # LEGACY SERVICE ROUTES
    # ─────────────────────────────────────────────────────────────────────────
    # app.include_router(
    #     legacy_vendor_services_router,
    #     prefix=settings.API_V1_STR,
    # )

    # ─────────────────────────────────────────────────────────────────────────
    # NEW V2 ROUTERS
    # ─────────────────────────────────────────────────────────────────────────
    app.include_router(
        VendorCreateService,
        prefix="/api/v1",
        tags=["vendor-services-v2"],
    )

    app.include_router(
        admin_moderation,
        prefix="/api/v1",
        tags=["admin-moderation"],
    )

    # ─────────────────────────────────────────────────────────────────────────
    # ROOT
    # ─────────────────────────────────────────────────────────────────────────
    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "message": (
                "Wedding Marketplace API is running"
            ),
            "version": "2.0.0",
            "environment": settings.ENVIRONMENT,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # HEALTH CHECK
    # ─────────────────────────────────────────────────────────────────────────
    @app.get("/health", tags=["health"])
    async def health_check():
        return {
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "version": app.version,
        }

    return app

# ─────────────────────────────────────────────────────────────────────────────
# APP INSTANCE
# ─────────────────────────────────────────────────────────────────────────────
app = create_app()