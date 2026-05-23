# ─────────────────────────────────────────────────────────────────────────────
# workers/tasks/media_processing.py
# ─────────────────────────────────────────────────────────────────────────────
import logging
from uuid import uuid4
from celery import shared_task
from sqlalchemy import select, update as sa_update
 
from app.workers.celery_app import celery_app
from app.infrastructure.db.session import SyncSessionLocal
from app.infrastructure.storage.factory import get_storage_backend
from app.infrastructure.db.models.upload_staging import UploadStaging, UploadStatus
from app.infrastructure.db.models.service_media import ServiceMedia
from app.infrastructure.db.models.service import Service
 
logger = logging.getLogger(__name__)
 
 
@celery_app.task(
    bind=True,
    max_retries=5,
    default_retry_delay=30,
    acks_late=True,
    queue="media",
)
def finalize_uploads(self, service_id: int, version_id: int):
    """
    Called after service creation DB transaction is committed.
    Moves temp files → final paths and inserts ServiceMedia rows.
    On partial failure: compensates by deleting any finalized files,
    then retries.
    """
    storage = get_storage_backend()
    finalized_this_run: list[tuple[str, str]] = []  # (temp_key, final_key)
 
    with SyncSessionLocal() as db:
        rows = db.execute(
            select(UploadStaging).where(
                UploadStaging.service_id == service_id,
                UploadStaging.version_id == version_id,
                UploadStaging.status == UploadStatus.pending,
            )
        ).scalars().all()
 
        if not rows:
            logger.info(f"No pending uploads for service {service_id}, version {version_id}")
            return
 
        try:
            for row in rows:
                ext = row.content_type.split("/")[-1].replace("jpeg", "jpg")
                final_key = f"services/{service_id}/{version_id}/{uuid4().hex}.{ext}"
 
                result = storage.copy_sync(row.temp_key, final_key)
 
                media = ServiceMedia(
                    service_id=service_id,
                    version_id=version_id,
                    media_url=result.public_url,
                    storage_key=final_key,
                    media_type=row.media_type,
                    source_type="upload",
                    is_cover=row.is_cover,
                    display_order=row.display_order,
                    metadata_=row.meta or {},
                )
                db.add(media)
 
                row.final_key = final_key
                row.status = UploadStatus.finalized
                finalized_this_run.append((row.temp_key, final_key))
 
            # All files finalized — update service status
            db.execute(
                sa_update(Service)
                .where(Service.id == service_id)
                .values(status="pending_review")
            )
            db.commit()
 
            # Schedule temp cleanup (async, non-critical)
            cleanup_temp_files.apply_async(
                kwargs={"temp_keys": [t for t, _ in finalized_this_run]},
                countdown=300,  # 5 min delay — give CDN time to propagate
                queue="maintenance",
            )
 
            # Schedule media optimization
            for media_id in [m.id for m in db.execute(
                select(ServiceMedia.id).where(
                    ServiceMedia.service_id == service_id,
                    ServiceMedia.version_id == version_id,
                    ServiceMedia.media_type == "image",
                )
            ).scalars().all()]:
                optimize_image.apply_async(
                    kwargs={"service_media_id": media_id},
                    queue="media",
                )
 
        except Exception as exc:
            logger.error(
                f"finalize_uploads failed for service={service_id}, "
                f"version={version_id}: {exc}",
                exc_info=True,
            )
            db.rollback()
 
            # Compensate: delete files finalized in this run
            for _, fk in finalized_this_run:
                try:
                    storage.delete_sync(fk)
                except Exception as del_err:
                    logger.warning(f"Could not delete {fk} during compensation: {del_err}")
 
            raise self.retry(exc=exc)
 
 
@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, queue="maintenance")
def cleanup_temp_files(self, temp_keys: list[str]):
    """Delete temp storage files after finalization."""
    if not temp_keys:
        return
    storage = get_storage_backend()
    try:
        storage.delete_batch_sync(temp_keys)
        logger.info(f"Cleaned up {len(temp_keys)} temp files")
    except Exception as exc:
        raise self.retry(exc=exc)
 
 
@celery_app.task(bind=True, max_retries=3, default_retry_delay=30, queue="media")
def optimize_image(self, service_media_id: int):
    """
    Generate WebP + thumbnail versions of an uploaded image.
    Updates ServiceMedia with webp_url and thumb_url.
    """
    from PIL import Image
    import io
 
    storage = get_storage_backend()
 
    with SyncSessionLocal() as db:
        media = db.execute(
            select(ServiceMedia).where(ServiceMedia.id == service_media_id)
        ).scalar_one_or_none()
 
        if not media or not media.storage_key:
            return
 
        try:
            raw = storage.download_sync(media.storage_key)
            img = Image.open(io.BytesIO(raw))
 
            # Convert to RGB if needed (e.g. RGBA PNG)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
 
            base_key = media.storage_key.rsplit(".", 1)[0]
 
            # ── WebP (full resolution, optimized) ────────────────────────────
            webp_buf = io.BytesIO()
            img.save(webp_buf, "WEBP", quality=82, method=6)
            webp_key = f"{base_key}_opt.webp"
            storage.upload_sync(webp_key, webp_buf.getvalue(), "image/webp")
 
            # ── Thumbnail 480×320 ─────────────────────────────────────────────
            thumb = img.copy()
            thumb.thumbnail((480, 320), Image.LANCZOS)
            thumb_buf = io.BytesIO()
            thumb.save(thumb_buf, "WEBP", quality=72)
            thumb_key = f"{base_key}_thumb.webp"
            storage.upload_sync(thumb_key, thumb_buf.getvalue(), "image/webp")
 
            from app.core.config import settings
            cdn = settings.CDN_BASE.rstrip("/")
 
            db.execute(
                sa_update(ServiceMedia)
                .where(ServiceMedia.id == service_media_id)
                .values(
                    webp_url=f"{cdn}/{webp_key}",
                    thumb_url=f"{cdn}/{thumb_key}",
                )
            )
            db.commit()
 
        except Exception as exc:
            logger.error(f"optimize_image failed for media {service_media_id}: {exc}")
            raise self.retry(exc=exc)