# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/events/publisher.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Lightweight async domain event publisher using Redis Streams.
Each event type maps to a stream. Consumers (Celery tasks or separate workers)
read from these streams to sync search indexes, send notifications, etc.
"""
import json
from datetime import datetime
import redis.asyncio as aioredis
from app.core.config import settings
 
_redis: aioredis.Redis | None = None
 
 
async def _get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = await aioredis.from_url(settings.REDIS_URL)
    return _redis
 
 
async def publish_event(event_type: str, payload: dict) -> None:
    """
    Publishes a domain event to a Redis Stream.
 
    Events:
      service.created, service.approved, service.rejected,
      service.updated, service.version_published,
      service.suspended, service.deleted
    """
    try:
        r = await _get_redis()
        stream_key = f"events:{event_type}"
        await r.xadd(
            stream_key,
            {
                "type": event_type,
                "payload": json.dumps(payload),
                "timestamp": datetime.utcnow().isoformat(),
            },
            maxlen=10_000,  # keep last 10k events per stream
            approximate=True,
        )
    except Exception as exc:
        # Non-critical: log but don't fail the request
        import logging
        logging.getLogger(__name__).warning(f"Failed to publish event {event_type}: {exc}")
 