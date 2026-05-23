# ─────────────────────────────────────────────────────────────────────────────
# services/admin_moderation.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Admin moderation service.
Handles: approve, reject, rollback, suspend, moderation queue.
All state changes are atomic: version state + service pointer updated in one transaction.
"""
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from deepdiff import DeepDiff
 
from app.infrastructure.db.models.models import Service
from app.infrastructure.db.models.service_version import (
    ServiceVersion, VersionState, assert_valid_transition, InvalidTransitionError
)
from app.infrastructure.db.models.audit_logs import AuditLog
from app.infrastructure.events.publisher import publish_event
from app.core.exceptions import NotFoundError, ConflictError
 
 
class ModerationService:
 
    def __init__(self, db: AsyncSession):
        self.db = db
 
    # ── Approve ───────────────────────────────────────────────────────────────
    async def approve(
        self,
        version_id: int,
        reviewer_id: int,
        notes: str | None = None,
        request_ip: str | None = None,
    ) -> ServiceVersion:
        version = await self._fetch_version(version_id)
        service = await self._fetch_service(version.service_id)
 
        # Determine correct target state
        if version.state == VersionState.pending_review:
            # First publish
            target = VersionState.published
        elif version.state == VersionState.pending_update_review:
            target = VersionState.update_approved
        else:
            raise ConflictError(f"Cannot approve a version in state '{version.state}'")
 
        assert_valid_transition(version.state, target)
 
        now = datetime.utcnow()
 
        # Archive old published version
        if service.current_published_version_id and service.current_published_version_id != version_id:
            await self.db.execute(
                update(ServiceVersion)
                .where(ServiceVersion.id == service.current_published_version_id)
                .values(state=VersionState.archived, updated_at=now)
            )
 
        # Promote new version
        version.state = VersionState.published
        version.reviewed_at = now
        version.reviewer_id = reviewer_id
        version.moderation_notes = notes
        version.published_at = now
 
        # Atomic pointer swap on services table
        service.current_published_version_id = version.id
        service.pending_version_id = None
        service.status = "published"
        service.is_verified = True
        service.updated_at = now
 
        self.db.add(AuditLog(
            entity_type="service_version",
            entity_id=version_id,
            actor_id=reviewer_id,
            actor_role="admin",
            action="approved",
            payload={
                "version_id": version_id,
                "service_id": version.service_id,
                "notes": notes,
            },
            ip_address=request_ip,
        ))
 
        await self.db.commit()
 
        await publish_event("service.approved", {
            "service_id": version.service_id,
            "version_id": version_id,
            "reviewer_id": reviewer_id,
        })
 
        return version
 
    # ── Reject ────────────────────────────────────────────────────────────────
    async def reject(
        self,
        version_id: int,
        reviewer_id: int,
        reason: str,
        request_ip: str | None = None,
    ) -> ServiceVersion:
        version = await self._fetch_version(version_id)
 
        if version.state == VersionState.pending_review:
            target = VersionState.rejected
        elif version.state == VersionState.pending_update_review:
            target = VersionState.update_rejected
        else:
            raise ConflictError(f"Cannot reject a version in state '{version.state}'")
 
        assert_valid_transition(version.state, target)
 
        version.state = target
        version.reviewed_at = datetime.utcnow()
        version.reviewer_id = reviewer_id
        version.rejection_reason = reason
 
        # If update rejected, ensure service pointer stays on old published version (unchanged)
        # No pointer update needed — service.current_published_version_id already points to old
 
        # Clear pending pointer
        await self.db.execute(
            update(Service)
            .where(Service.id == version.service_id)
            .values(pending_version_id=None)
        )
 
        self.db.add(AuditLog(
            entity_type="service_version",
            entity_id=version_id,
            actor_id=reviewer_id,
            actor_role="admin",
            action="rejected",
            payload={"reason": reason},
            ip_address=request_ip,
        ))
 
        await self.db.commit()
 
        await publish_event("service.rejected", {
            "service_id": version.service_id,
            "version_id": version_id,
            "reason": reason,
        })
 
        return version
 
    # ── Rollback to previous version ──────────────────────────────────────────
    async def rollback(
        self,
        service_id: int,
        target_version_id: int,
        reviewer_id: int,
        reason: str,
    ) -> ServiceVersion:
        """
        Admin can restore any archived version as the new live version.
        Atomic: current published → archived, target → published.
        """
        target_version = await self._fetch_version(target_version_id)
 
        if target_version.service_id != service_id:
            raise ConflictError("Version does not belong to this service")
        if target_version.state not in (VersionState.archived, VersionState.published):
            raise ConflictError(f"Can only rollback to archived/published versions, got: {target_version.state}")
 
        service = await self._fetch_service(service_id)
        now = datetime.utcnow()
 
        # Archive current live
        if service.current_published_version_id:
            await self.db.execute(
                update(ServiceVersion)
                .where(ServiceVersion.id == service.current_published_version_id)
                .values(state=VersionState.archived, updated_at=now)
            )
 
        # Restore target
        target_version.state = VersionState.published
        target_version.reviewed_at = now
        target_version.reviewer_id = reviewer_id
        target_version.published_at = now
        target_version.moderation_notes = f"Rollback: {reason}"
 
        service.current_published_version_id = target_version_id
        service.updated_at = now
 
        self.db.add(AuditLog(
            entity_type="service",
            entity_id=service_id,
            actor_id=reviewer_id,
            actor_role="admin",
            action="rollback",
            payload={"target_version_id": target_version_id, "reason": reason},
        ))
 
        await self.db.commit()
        return target_version
 
    # ── Version Diff ──────────────────────────────────────────────────────────
    async def get_diff(self, version_a_id: int, version_b_id: int) -> dict:
        """Compare two version snapshots field-by-field."""
        va = await self._fetch_version(version_a_id)
        vb = await self._fetch_version(version_b_id)
 
        raw_diff = DeepDiff(va.snapshot, vb.snapshot, ignore_order=True, verbose_level=2)
        return {
            "version_a": version_a_id,
            "version_b": version_b_id,
            "changed_fields": sorted(raw_diff.get("values_changed", {}).keys()),
            "added_fields":   sorted(str(p) for p in raw_diff.get("dictionary_item_added", set())),
            "removed_fields": sorted(str(p) for p in raw_diff.get("dictionary_item_removed", set())),
            "type_changes":   sorted(raw_diff.get("type_changes", {}).keys()),
        }
 
    # ── Moderation Queue ──────────────────────────────────────────────────────
    async def get_queue(self, page: int = 1, page_size: int = 20) -> list[ServiceVersion]:
        result = await self.db.execute(
            select(ServiceVersion)
            .where(ServiceVersion.state.in_([
                VersionState.pending_review,
                VersionState.pending_update_review,
            ]))
            .order_by(ServiceVersion.submitted_at.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return result.scalars().all()
 
    # ── Helpers ───────────────────────────────────────────────────────────────
    async def _fetch_version(self, version_id: int) -> ServiceVersion:
        result = await self.db.execute(
            select(ServiceVersion).where(ServiceVersion.id == version_id)
        )
        v = result.scalar_one_or_none()
        if not v:
            raise NotFoundError(f"ServiceVersion {version_id} not found")
        return v
 
    async def _fetch_service(self, service_id: int) -> Service:
        result = await self.db.execute(
            select(Service).where(Service.id == service_id)
        )
        s = result.scalar_one_or_none()
        if not s:
            raise NotFoundError(f"Service {service_id} not found")
        return s