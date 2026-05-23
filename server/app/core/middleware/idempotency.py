# ─────────────────────────────────────────────────────────────────────────────
# core/middleware/idempotency.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Idempotency middleware.
Requires frontend to send a unique Idempotency-Key header on all POST/PUT/PATCH requests.
On first request: execute normally and cache response.
On replay with same key: return cached response immediately.
"""
import json
import hashlib
from datetime import datetime, timedelta
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import select, insert
from app.infrastructure.db.session import SyncSessionLocal
from app.infrastructure.db.models.idempotency import IdempotencyRecord
 
IDEMPOTENT_METHODS = {"POST", "PUT", "PATCH"}
IDEMPOTENCY_TTL_HOURS = 24
MAX_KEY_LENGTH = 128
 
 
class IdempotencyMiddleware(BaseHTTPMiddleware):
 
    async def dispatch(self, request: Request, call_next):
        # Only apply to mutating methods
        if request.method not in IDEMPOTENT_METHODS:
            return await call_next(request)
 
        idem_key = request.headers.get("Idempotency-Key", "").strip()
        if not idem_key:
            return await call_next(request)
 
        if len(idem_key) > MAX_KEY_LENGTH:
            return Response(
                content=json.dumps({"error": "Idempotency-Key too long"}),
                status_code=400,
                media_type="application/json",
            )
 
        # Check existing record
        with SyncSessionLocal() as db:
            existing = db.execute(
                select(IdempotencyRecord).where(
                    IdempotencyRecord.key == idem_key,
                    IdempotencyRecord.expires_at > datetime.utcnow(),
                )
            ).scalar_one_or_none()
 
            if existing and existing.response_body is not None:
                return Response(
                    content=json.dumps(existing.response_body),
                    status_code=existing.status_code,
                    media_type="application/json",
                    headers={
                        "X-Idempotent-Replayed": "true",
                        "X-Request-ID": idem_key,
                    },
                )
 
        # Execute original request
        response = await call_next(request)
 
        # Collect response body
        body_chunks: list[bytes] = []
        async for chunk in response.body_iterator:
            body_chunks.append(chunk)
        body = b"".join(body_chunks)
 
        # Persist idempotency record
        try:
            with SyncSessionLocal() as db:
                db.execute(
                    insert(IdempotencyRecord)
                    .values(
                        key=idem_key,
                        request_hash=hashlib.sha256(body).hexdigest(),
                        response_body=json.loads(body) if body else None,
                        status_code=response.status_code,
                        expires_at=datetime.utcnow() + timedelta(hours=IDEMPOTENCY_TTL_HOURS),
                    )
                    .on_conflict_do_nothing(index_elements=["key"])  # race condition safety
                )
                db.commit()
        except Exception:
            pass  # don't fail the original request over idempotency logging
 
        return Response(
            content=body,
            status_code=response.status_code,
            media_type=response.media_type,
            headers=dict(response.headers),
        )