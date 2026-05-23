from typing import List

from fastapi import HTTPException, UploadFile

from app.infrastructure.storage.interface import (
    AbstractStorageBackend,
)

from app.core.security import (
    validate_external_url,
)


async def upload_media_files(
    storage: AbstractStorageBackend,

    images: List[UploadFile],

    videos: List[UploadFile],

    image_meta: list,

    external_media: list,

    vendor_id: int,

    service_id: int,
):
    """
    Unified media upload pipeline.

    Handles:
    - image uploads
    - video uploads
    - external media links
    - provider abstraction (Supabase/S3/R2/etc.)
    """

    uploaded_media = []

    display_order = 0

    # ─────────────────────────────────────────────────────────────────────────
    # IMAGE UPLOADS
    # ─────────────────────────────────────────────────────────────────────────

    for index, image in enumerate(images):

        file_path = (
            f"vendors/"
            f"{vendor_id}/"
            f"services/"
            f"{service_id}/"
            f"images/"
            f"{image.filename}"
        )

        uploaded = await storage.upload_file(
            file=image,
            path=file_path,
            content_type=image.content_type,
        )

        meta = (
            image_meta[index]
            if index < len(image_meta)
            else {}
        )

        uploaded_media.append({
            "media_url": uploaded,

            "media_type": "image",

            "source_type": "upload",

            "is_cover": meta.get(
                "is_cover",
                False,
            ),

            "display_order": meta.get(
                "display_order",
                display_order,
            ),

            "metadata": meta.get(
                "metadata",
                {},
            ),
        })

        display_order += 1

    # ─────────────────────────────────────────────────────────────────────────
    # VIDEO UPLOADS
    # ─────────────────────────────────────────────────────────────────────────

    for video in videos:

        file_path = (
            f"vendors/"
            f"{vendor_id}/"
            f"services/"
            f"{service_id}/"
            f"videos/"
            f"{video.filename}"
        )

        uploaded = await storage.upload_file(
            file=video,
            path=file_path,
            content_type=video.content_type,
        )

        uploaded_media.append({
            "media_url": uploaded,

            "media_type": "video",

            "source_type": "upload",

            "is_cover": False,

            "display_order": display_order,

            "metadata": {},
        })

        display_order += 1

    # ─────────────────────────────────────────────────────────────────────────
    # EXTERNAL MEDIA
    # ─────────────────────────────────────────────────────────────────────────

    for item in external_media:

        media_url = (
            item.get("media_url")
            or item.get("url")
        )

        if not media_url:
            raise HTTPException(
                status_code=400,
                detail="External media URL missing",
            )

        # SSRF protection
        validate_external_url(media_url)

        uploaded_media.append({
            "media_url": media_url,

            "media_type": item.get(
                "media_type",
                "image",
            ),

            "source_type": "external",

            "is_cover": item.get(
                "is_cover",
                False,
            ),

            "display_order": item.get(
                "display_order",
                display_order,
            ),

            "metadata": item.get(
                "metadata",
                {},
            ),
        })

        display_order += 1

    return uploaded_media