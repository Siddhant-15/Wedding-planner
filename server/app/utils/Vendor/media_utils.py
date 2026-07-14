"""
app/utils/Vendor/media_utils.py

Supabase storage upload helper.
Uploads a file and returns the public URL string.
"""

from __future__ import annotations

import logging
import mimetypes
from uuid import uuid4

from fastapi import UploadFile

from app.utils.supabase_client import supabase

logger = logging.getLogger(__name__)

_BUCKET = "service-images"


async def _upload_media(file: UploadFile) -> str:
    """
    Upload an image or video UploadFile to Supabase storage.

    Returns:
        Public URL string for the uploaded file.

    Raises:
        RuntimeError: if the Supabase SDK raises during upload.
    """
    file_bytes = await file.read()

    ext = (
        file.filename.rsplit(".", 1)[-1].lower()
        if file.filename and "." in file.filename
        else "jpg"
    )

    file_path    = f"services/{uuid4().hex}.{ext}"
    content_type = (
        mimetypes.guess_type(file.filename or "")[0]
        or "application/octet-stream"
    )

    try:
        supabase.storage.from_(_BUCKET).upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": content_type},
        )
    except Exception as exc:
        logger.exception("Supabase upload failed: path=%s", file_path)
        raise RuntimeError(f"Media upload failed: {exc}") from exc

    public_url = supabase.storage.from_(_BUCKET).get_public_url(file_path)

    # SDK returns either a plain string or a dict depending on version
    if isinstance(public_url, dict):
        return public_url.get("publicURL") or public_url.get("publicUrl", "")
    return str(public_url)