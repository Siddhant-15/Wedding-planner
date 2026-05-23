# ─────────────────────────────────────────────────────────────────────────────
# workers/beat_schedule.py  (Celery Beat periodic tasks)
# ─────────────────────────────────────────────────────────────────────────────
from celery.schedules import crontab
from app.workers.celery_app import celery_app
 
celery_app.conf.beat_schedule = {
    # Clean stale temp uploads every hour
    "cleanup-stale-uploads": {
        "task": "app.workers.tasks.stale_upload_cleanup.cleanup_stale_uploads",
        "schedule": crontab(minute=0),  # every hour on the hour
    },
    # Purge expired idempotency records daily
    "cleanup-idempotency-records": {
        "task": "app.workers.tasks.stale_upload_cleanup.cleanup_idempotency_records",
        "schedule": crontab(hour=3, minute=0),  # 3 AM UTC
    },
    # Re-sync any out-of-date search index entries
    "search-index-reconcile": {
        "task": "app.workers.tasks.search_index_sync.reconcile_index",
        "schedule": crontab(hour="*/6"),  # every 6 hours
    },
}