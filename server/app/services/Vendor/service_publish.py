from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.infrastructure.db.models.service import Service
from app.infrastructure.db.models.service_version import ServiceVersion, VersionState, assert_valid_transition
from app.infrastructure.db.models.audit_log import AuditLog
from app.infrastructure.events.publisher import publish_event


class ModerationService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def approve_version(
        self,
        version_id: int,
        reviewer_id: int,
        notes: str | None = None,
    ) -> ServiceVersion:
        version = await self._get_version(version_id)
        service = await self._get_service(version.service_id)

        # Validate transition
        if version.state == VersionState.pending_review:
            assert_valid_transition(version.state, VersionState.published)
        elif version.state == VersionState.pending_update_review:
            assert_valid_transition(version.state, VersionState.update_approved)
        else:
            raise ValueError(f"Cannot approve version in state: {version.state}")

        now = datetime.utcnow()

        # Archive previous published version if exists
        if service.current_published_version_id:
            await self.db.execute(
                update(ServiceVersion)
                .where(ServiceVersion.id == service.current_published_version_id)
                .values(state=VersionState.archived)
            )

        # Atomic swap: new version becomes published
        version.state = VersionState.published
        version.reviewed_at = now
        version.reviewer_id = reviewer_id
        version.moderation_notes = notes
        version.published_at = now

        service.current_published_version_id = version.id
        service.pending_version_id = None
        service.status = "published"
        service.updated_at = now

        self.db.add(AuditLog(
            entity_type="service_version",
            entity_id=version.id,
            actor_id=reviewer_id,
            actor_role="admin",
            action="approved",
            payload={"version_id": version_id, "service_id": version.service_id},
        ))

        await self.db.commit()

        await publish_event("service.approved", {
            "service_id": version.service_id,
            "version_id": version_id,
            "reviewer_id": reviewer_id,
        })

        return version

    async def reject_version(
        self,
        version_id: int,
        reviewer_id: int,
        reason: str,
    ) -> ServiceVersion:
        version = await self._get_version(version_id)

        assert_valid_transition(
            version.state,
            VersionState.rejected if version.state == VersionState.pending_review
            else VersionState.update_rejected
        )

        version.state = (
            VersionState.rejected
            if version.state == VersionState.pending_review
            else VersionState.update_rejected
        )
        version.reviewed_at = datetime.utcnow()
        version.reviewer_id = reviewer_id
        version.rejection_reason = reason

        self.db.add(AuditLog(
            entity_type="service_version",
            entity_id=version_id,
            actor_id=reviewer_id,
            actor_role="admin",
            action="rejected",
            payload={"reason": reason},
        ))

        await self.db.commit()

        await publish_event("service.rejected", {
            "service_id": version.service_id,
            "version_id": version_id,
            "reason": reason,
        })

        return version

    async def _get_version(self, version_id: int) -> ServiceVersion:
        result = await self.db.execute(
            select(ServiceVersion).where(ServiceVersion.id == version_id)
        )
        v = result.scalar_one_or_none()
        if not v:
            raise ValueError(f"ServiceVersion {version_id} not found")
        return v

    async def _get_service(self, service_id: int) -> Service:
        result = await self.db.execute(
            select(Service).where(Service.id == service_id)
        )
        s = result.scalar_one_or_none()
        if not s:
            raise ValueError(f"Service {service_id} not found")
        return s