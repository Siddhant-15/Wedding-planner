# ─────────────────────────────────────────────────────────────────────────────
# workers/celery_app.py
# ─────────────────────────────────────────────────────────────────────────────
from celery import Celery
from app.core.config import settings
 
celery_app = Celery(
    "wedding_marketplace",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.tasks.media_processing",
        "app.workers.tasks.stale_upload_cleanup",
        "app.workers.tasks.search_index_sync",
        "app.workers.tasks.notifications",
    ],
)
 
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,               # re-queue on worker crash
    task_reject_on_worker_lost=True,   # don't lose tasks
    worker_prefetch_multiplier=1,      # fair scheduling for long tasks
    task_routes={
        "app.workers.tasks.media_processing.*":      {"queue": "media"},
        "app.workers.tasks.search_index_sync.*":     {"queue": "search"},
        "app.workers.tasks.notifications.*":         {"queue": "notifications"},
        "app.workers.tasks.stale_upload_cleanup.*":  {"queue": "maintenance"},
    },
)