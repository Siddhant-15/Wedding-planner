# ─────────────────────────────────────────────────────────────────────────────
# core/middleware/rate_limit.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Redis sliding window rate limiter.
Configured per-path per-user. Vendor uploads are capped at 20/min.
Service creates are capped at 5/min per vendor.
"""
import time
import json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as aioredis
 
from app.core.config import settings
 
# (path_prefix, max_calls, window_seconds)
RATE_LIMITS: dict[str, tuple[int, int]] = {
    "/api/v1/vendor/services/create":   (5, 60),
    "/api/v1/vendor/media/upload":      (20, 60),
    "/api/v1/vendor/services/update":   (10, 60),
    "/api/v1/admin/moderation/approve": (100, 60),
    "/api/v1/admin/moderation/reject":  (100, 60),
}
 
 
class RateLimitMiddleware(BaseHTTPMiddleware):
 
    def __init__(self, app):
        super().__init__(app)
        self._redis: aioredis.Redis | None = None
 
    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = await aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis
 
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
 
        limit_config = None
        for prefix, config in RATE_LIMITS.items():
            if path.startswith(prefix):
                limit_config = config
                break
 
        if limit_config is None:
            return await call_next(request)
 
        max_calls, window = limit_config
 
        # Identify user by JWT sub or fall back to IP
        user_key = request.client.host if request.client else "anon"
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            # Use first 16 chars of token as key suffix (don't parse full JWT in middleware)
            user_key = auth[7:23]
 
        rl_key = f"rl:{path}:{user_key}"
 
        try:
            redis = await self._get_redis()
            now = int(time.time() * 1000)  # ms precision
            window_start = now - (window * 1000)
 
            async with redis.pipeline(transaction=True) as pipe:
                pipe.zremrangebyscore(rl_key, 0, window_start)
                pipe.zadd(rl_key, {str(now): now})
                pipe.zcard(rl_key)
                pipe.pexpire(rl_key, window * 1000)
                results = await pipe.execute()
 
            count = results[2]
 
            if count > max_calls:
                return Response(
                    content=json.dumps({
                        "error": "Rate limit exceeded",
                        "retry_after": window,
                    }),
                    status_code=429,
                    media_type="application/json",
                    headers={
                        "Retry-After": str(window),
                        "X-RateLimit-Limit": str(max_calls),
                        "X-RateLimit-Remaining": "0",
                    },
                )
        except Exception:
            # Redis unavailable — fail open (don't block requests)
            pass
 
        return await call_next(request)