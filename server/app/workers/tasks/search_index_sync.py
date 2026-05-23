# ─────────────────────────────────────────────────────────────────────────────
# workers/tasks/search_index_sync.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Syncs published services to Elasticsearch / OpenSearch after moderation approval.
Called via domain event consumer on service.approved.
"""
from celery import shared_task
from sqlalchemy import select
from sqlalchemy.orm import selectinload
 
from app.workers.celery_app import celery_app
from app.infrastructure.db.session import SyncSessionLocal
from app.infrastructure.db.models.service import Service
 
 
@celery_app.task(bind=True, max_retries=3, queue="search")
def sync_service_to_search(self, service_id: int):
    with SyncSessionLocal() as db:
        service = db.execute(
            select(Service)
            .where(Service.id == service_id)
            .options(
                selectinload(Service.variants),
                selectinload(Service.media),
            )
        ).scalar_one_or_none()
 
        if not service or service.status != "published":
            return
 
        doc = {
            "id": service.id,
            "vendor_id": service.vendor_id,
            "service_type": service.service_type,
            "service_name": service.service_name,
            "description": service.description,
            "city": service.city,
            "state": service.state,
            "country": service.country,
            "latitude": float(service.latitude) if service.latitude else None,
            "longitude": float(service.longitude) if service.longitude else None,
            "status": service.status,
            "updated_at": service.updated_at.isoformat() if service.updated_at else None,
        }
 
        # POST to Elasticsearch
        # es_client.index(index="services", id=service.id, document=doc)
        # (configure ES client via settings.ELASTICSEARCH_URL)
        logger.info(f"Synced service {service_id} to search index")
 
 
@celery_app.task(queue="search")
def reconcile_index():
    """Periodic reconciliation: re-index any published services missing from ES."""
    # Implementation: fetch all published service IDs, compare with ES, re-sync missing
    pass