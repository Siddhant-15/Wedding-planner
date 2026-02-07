# app/Db/db.py
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

logger = logging.getLogger(__name__)

# ─── Async Engine for runtime (FastAPI) ─────────────────────────────────────
# Use ASYNC_DATABASE_URL with an async driver (e.g. postgresql+asyncpg://...)
engine: AsyncEngine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_size=15,
    max_overflow=20,
    pool_timeout=45,
    pool_recycle=1800,
    pool_pre_ping=True,
    echo=settings.SQL_ECHO,
    future=True,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ─── Dependency (preferred context-manager style) ───────────────────────────
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


# Alternative classic style
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_db_session() as session:
        yield session


# ─── Startup / Shutdown helpers ─────────────────────────────────────────────
async def startup_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection pool initialized successfully")
    except Exception as e:
        logger.error("Database connection failed on startup", exc_info=True)
        raise


async def shutdown_db():
    await engine.dispose()
    logger.info("Database engine disposed")