# ─────────────────────────────────────────────────────────────────────────────
# workers/tasks/stale_upload_cleanup.py
# ─────────────────────────────────────────────────────────────────────────────
from datetime import datetime, timedelta
from celery import shared_task
from sqlalchemy import select, delete as sa_delete
 
from app.workers.celery_app import celery_app
from app.infrastructure.db.session import SyncSessionLocal
from app.infrastructure.storage.factory import get_storage_backend
from app.infrastructure.db.models.upload_staging import UploadStaging, UploadStatus
from app.infrastructure.db.models.idempotency import IdempotencyRecord
 
 
@celery_app.task(queue="maintenance")
def cleanup_stale_uploads():
    """
    Run every hour via Celery Beat.
    Deletes temp files for uploads stuck in 'pending' for more than 2 hours.
    These represent requests that uploaded files but whose DB transaction failed
    AND whose Celery task also never ran or was lost.
    """
    cutoff = datetime.utcnow() - timedelta(hours=2)
    storage = get_storage_backend()
 
    with SyncSessionLocal() as db:
        stale = db.execute(
            select(UploadStaging).where(
                UploadStaging.status == UploadStatus.pending,
                UploadStaging.created_at < cutoff,
            )
        ).scalars().all()
 
        if not stale:
            return
 
        temp_keys = [r.temp_key for r in stale if r.temp_key]
        if temp_keys:
            storage.delete_batch_sync(temp_keys)
 
        for row in stale:
            row.status = UploadStatus.cleaned
 
        db.commit()
        logger.info(f"Cleaned {len(stale)} stale upload_staging rows")
 
 
@celery_app.task(queue="maintenance")
def cleanup_idempotency_records():
    """Run daily. Remove expired idempotency records to keep the table small."""
    with SyncSessionLocal() as db:
        db.execute(
            sa_delete(IdempotencyRecord).where(
                IdempotencyRecord.expires_at < datetime.utcnow()
            )
        )
        db.commit()