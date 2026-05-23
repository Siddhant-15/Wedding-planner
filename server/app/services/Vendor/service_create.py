import json, hashlib
from uuid import uuid4
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.storage.interface import AbstractStorageBackend
from app.infrastructure.storage.validation import (
    validate_and_read_file, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES,
    MAX_IMAGE_BYTES, MAX_VIDEO_BYTES,
)
from app.infrastructure.db.models.service import Service
from app.infrastructure.db.models.service_version import ServiceVersion, VersionState
from app.infrastructure.db.models.upload_staging import UploadStaging, UploadStatus
from app.infrastructure.db.models.service_variant import ServiceVariant
from app.infrastructure.events.publisher import publish_event
from app.workers.tasks.media_processing import finalize_uploads
from app.schemas.vendor.service import ServiceCreate, ServiceCreateResponse
from app.utils.variants import enforce_variants


class ServiceCreateService:

    def __init__(self, db: AsyncSession, storage: AbstractStorageBackend):
        self.db = db
        self.storage = storage

    async def execute(
        self,
        vendor_id: int,
        parsed: ServiceCreate,
        images: list[UploadFile],
        videos: list[UploadFile],
        image_meta: list[dict],
        external_media: list[dict],
        idempotency_key: str,
    ) -> ServiceCreateResponse:

        session_id = uuid4().hex
        temp_uploads: list[tuple[str, bytes, str]] = []  # (key, data, content_type)

        # ── 1. Validate + read all files (before DB work) ──────────────────
        validated_images = []
        for img in images:
            data, ct = await validate_and_read_file(img, ALLOWED_IMAGE_MIMES, MAX_IMAGE_BYTES)
            ext = ct.split("/")[-1]
            key = f"temp/{session_id}/{uuid4().hex}.{ext}"
            validated_images.append((img, data, ct, key))

        validated_videos = []
        for vid in videos:
            data, ct = await validate_and_read_file(vid, ALLOWED_VIDEO_MIMES, MAX_VIDEO_BYTES)
            ext = ct.split("/")[-1]
            key = f"temp/{session_id}/{uuid4().hex}.{ext}"
            validated_videos.append((vid, data, ct, key))

        # ── 2. Upload to temp storage ────────────────────────────────────────
        # Do this BEFORE DB transaction so we can clean up if DB fails.
        temp_keys = []
        try:
            for _, data, ct, key in validated_images + validated_videos:
                result = await self.storage.upload(key, data, ct)
                temp_keys.append(key)
        except Exception:
            await self.storage.delete_batch(temp_keys)
            raise

        # ── 3. DB Transaction ───────────────────────────────────────────────
        try:
            service = Service(
                vendor_id=vendor_id,
                service_type=parsed.service_type,
                service_name=parsed.service_name,
                description=parsed.description,
                add_line1=parsed.add_line1,
                add_line2=parsed.add_line2,
                area=parsed.area,
                city=parsed.city,
                state=parsed.state,
                country=parsed.country,
                pincode=parsed.pincode,
                latitude=parsed.latitude,
                longitude=parsed.longitude,
                metadata_=parsed.metadata_.dict() if parsed.metadata_ else {},
                status="draft",
            )
            self.db.add(service)
            await self.db.flush()  # get service.id

            version = ServiceVersion(
                service_id=service.id,
                version_number=1,
                state=VersionState.pending_review,
                snapshot=parsed.dict(),
                created_by=vendor_id,
            )
            self.db.add(version)
            await self.db.flush()  # get version.id

            # variants
            variants = enforce_variants(parsed.variants)
            for v in variants:
                self.db.add(ServiceVariant(service_id=service.id, **v.dict()))

            # upload staging rows
            order = 0
            all_validated = list(validated_images) + list(validated_videos)
            for i, (_, data, ct, key) in enumerate(all_validated):
                is_image = i < len(validated_images)
                idx = i if is_image else i - len(validated_images)
                meta = image_meta[idx] if is_image and idx < len(image_meta) else {}
                checksum = hashlib.md5(data).hexdigest()
                self.db.add(UploadStaging(
                    service_id=service.id,
                    version_id=version.id,
                    idempotency_key=idempotency_key,
                    temp_key=key,
                    media_type="image" if is_image else "video",
                    content_type=ct,
                    size_bytes=len(data),
                    checksum=checksum,
                    display_order=meta.get("display_order", order),
                    is_cover=meta.get("is_cover", False),
                    status=UploadStatus.pending,
                ))
                order += 1

            # external media saved directly (no upload needed)
            for ext_item in external_media:
                from app.infrastructure.db.models.service_media import ServiceMedia
                self.db.add(ServiceMedia(
                    service_id=service.id,
                    version_id=version.id,
                    media_url=ext_item["media_url"],
                    media_type=ext_item.get("media_type", "image"),
                    source_type="external",
                    display_order=order,
                    is_cover=False,
                    metadata_=ext_item.get("metadata", {}),
                ))
                order += 1

            await self.db.commit()

        except Exception:
            await self.db.rollback()
            # Clean up temp files — DB never committed so no orphan rows
            await self.storage.delete_batch(temp_keys)
            raise

        # ── 4. Enqueue finalization (async) ──────────────────────────────────
        finalize_uploads.apply_async(
            kwargs={"service_id": service.id, "version_id": version.id},
            countdown=2,
        )

        # ── 5. Publish domain event ──────────────────────────────────────────
        await publish_event("service.created", {
            "service_id": service.id,
            "vendor_id": vendor_id,
            "version_id": version.id,
        })

        return ServiceCreateResponse(
            message="Service submitted for review",
            service_id=service.id,
            version_id=version.id,
        )