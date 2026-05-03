# app/main.py
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.Db.db import startup_db, shutdown_db
from app.routers.auth import AuthRouter
from app.routers.service import servicerouter
from app.routers.customer_services import customerservicerouter
from app.routers.vendor import vendorrouter
from app.routers.review import Reviewrouter
from app.routers.wishlist_routes import wishlistrouter
from app.routers.customer.lead_routes import LeadRouter


# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─── Lifespan ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Application startup - initializing database connection pool")
    await startup_db()

    # No create_all() here anymore → handled by Alembic migrations
    # If you ever need to debug tables exist → you can run alembic upgrade head manually

    yield

    logger.info("Application shutdown - disposing database engine")
    await shutdown_db()


# ─── FastAPI App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="Wedding Planner API",
    description="Backend API for wedding planning platform",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
    debug=settings.DEBUG,
)


# ─── CORS ───────────────────────────────────────────────────────────────────
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
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["X-Total-Count"],
)


# ─── Routers ────────────────────────────────────────────────────────────────
app.include_router(AuthRouter, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(servicerouter, prefix=settings.API_V1_STR)
app.include_router(customerservicerouter, prefix=settings.API_V1_STR, tags=["customer_services"])
app.include_router(wishlistrouter, prefix=settings.API_V1_STR)
app.include_router(vendorrouter, prefix=settings.API_V1_STR)
app.include_router(Reviewrouter, prefix=settings.API_V1_STR)
app.include_router(LeadRouter, prefix=settings.API_V1_STR)

# ─── Exception Handlers ─────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # Convert errors to JSON-serializable format
    serializable_errors = []
    for error in errors:
        serializable_error = {
            "type": error.get("type"),
            "loc": list(error.get("loc", [])),
            "msg": str(error.get("msg", "")),
            "input": str(error.get("input", "")) if error.get("input") is not None else None,
        }
        if "ctx" in error:
            serializable_error["ctx"] = {k: str(v) for k, v in error["ctx"].items()}
        serializable_errors.append(serializable_error)
    
    logger.warning(f"Validation error: {serializable_errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": serializable_errors, "message": "Validation failed"},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Database operation failed. Please try again later."},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ─── Health & Root ──────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Wedding Planner API is running"}


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": app.version,
    }