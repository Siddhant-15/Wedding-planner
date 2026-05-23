# alembic/env.py (async pattern)
from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
import asyncio
from app.infrastructure.db.base import Base

def run_migrations_online():
    connectable = async_engine_from_config(
        context.config.get_section(context.config.config_ini_section),
        prefix="sqlalchemy.",
    )
    async def do_run():
        async with connectable.connect() as conn:
            await conn.run_sync(context.run_migrations)
    asyncio.run(do_run())