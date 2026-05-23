# core/middleware/logging.py
import structlog, time, uuid
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        start = time.perf_counter()
        request.state.request_id = request_id

        log = logger.bind(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        try:
            response = await call_next(request)
            log.info(
                "request_completed",
                status_code=response.status_code,
                duration_ms=round((time.perf_counter() - start) * 1000, 2),
            )
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as exc:
            log.error("request_failed", error=str(exc))
            raise