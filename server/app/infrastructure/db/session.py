# ─────────────────────────────────────────────────────────────────────────────
# app/infrastructure/db/session.py
# Centralized SQLAlchemy session management
# Supports:
# - Async FastAPI sessions
# - Sync middleware sessions
# - Background workers
# - Health checks
# ─────────────────────────────────────────────────────────────────────────────

import logging

from contextlib import asynccontextmanager

from typing import AsyncGenerator

from sqlalchemy import (
    create_engine,
    text,
)

from sqlalchemy.orm import (
    sessionmaker,
)

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# ASYNC ENGINE
# Used by:
# - FastAPI routes
# - async services
# - async background tasks
# ─────────────────────────────────────────────────────────────────────────────

engine: AsyncEngine = create_async_engine(
    settings.ASYNC_DATABASE_URL,

    # Pooling
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,

    # Reliability
    pool_pre_ping=True,

    # Debugging
    echo=settings.SQL_ECHO,

    # SQLAlchemy 2.0
    future=True,
)

# ─────────────────────────────────────────────────────────────────────────────
# ASYNC SESSION FACTORY
# ─────────────────────────────────────────────────────────────────────────────

AsyncSessionLocal = async_sessionmaker(
    bind=engine,

    class_=AsyncSession,

    # Prevent detached objects
    expire_on_commit=False,

    # Explicit flush control
    autoflush=False,

    autocommit=False,
)

# ─────────────────────────────────────────────────────────────────────────────
# SYNC ENGINE
# Required for:
# - middleware
# - sync jobs
# - alembic
# - blocking scripts
# ─────────────────────────────────────────────────────────────────────────────

SYNC_DATABASE_URL = (
    settings.ASYNC_DATABASE_URL
    .replace("+asyncpg", "")
)

sync_engine = create_engine(
    SYNC_DATABASE_URL,

    pool_pre_ping=True,

    echo=settings.SQL_ECHO,

    future=True,
)

# ─────────────────────────────────────────────────────────────────────────────
# SYNC SESSION FACTORY
# Used by middleware like:
# - idempotency
# - request logging
# ─────────────────────────────────────────────────────────────────────────────

SyncSessionLocal = sessionmaker(
    bind=sync_engine,

    autoflush=False,

    autocommit=False,
)

# ─────────────────────────────────────────────────────────────────────────────
# FASTAPI DATABASE DEPENDENCY
# Usage:
#   db: AsyncSession = Depends(get_db)
# ─────────────────────────────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:

    async with AsyncSessionLocal() as session:
        try:
            yield session

            # Commit automatically if successful
            await session.commit()

        except Exception:
            # Rollback on any failure
            await session.rollback()
            raise

        finally:
            await session.close()

# ─────────────────────────────────────────────────────────────────────────────
# MANUAL TRANSACTION CONTEXT
# Usage:
#
# async with get_db_session() as db:
#     ...
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:

    session = AsyncSessionLocal()

    try:
        yield session

        await session.commit()

    except Exception:
        await session.rollback()
        raise

    finally:
        await session.close()

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE STARTUP CHECK
# Called during FastAPI startup
# ─────────────────────────────────────────────────────────────────────────────

async def startup_db() -> None:

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

        logger.info(
            "Database connection pool initialized successfully"
        )

    except Exception:
        logger.exception(
            "Database connection failed during startup"
        )
        raise

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE SHUTDOWN
# Called during FastAPI shutdown
# ─────────────────────────────────────────────────────────────────────────────

async def shutdown_db() -> None:

    # Dispose async engine
    await engine.dispose()

    # Dispose sync engine
    sync_engine.dispose()

    logger.info("Database engines disposed")