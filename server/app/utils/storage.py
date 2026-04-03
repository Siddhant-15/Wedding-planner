# app/utils/storage.py
from typing import List, Optional
from fastapi import UploadFile
import uuid
import mimetypes

# Example: using Supabase (replace with your actual client)
from app.utils.supabase import get_supabase_client   # assume you have this

supabase = get_supabase_client()


async def upload_files(
    files: List[UploadFile],
    folder: str = "general",
    prefix: str = "file",
    bucket: str = "service-assets"
) -> List[str]:
    """
    Reusable upload function — returns list of public URLs
    Can be used by services, avatars, portfolios, etc.
    """
    urls = []

    for file in files:
        if not file.content_type:
            continue

        ext = mimetypes.guess_extension(file.content_type) or ".bin"
        if ext == ".bin":
            ext = "." + file.filename.split(".")[-1] if "." in file.filename else ""

        file_name = f"{prefix}-{uuid.uuid4().hex}{ext}"
        path = f"{folder}/{file_name}"

        content = await file.read()

        try:
            supabase.storage.from_(bucket).upload(
                path=path,
                file=content,
                file_options={"content-type": file.content_type}
            )
            public_url = supabase.storage.from_(bucket).get_public_url(path)
            urls.append(public_url)
        except Exception as e:
            # In production: log error, continue or raise depending on policy
            print(f"Upload failed for {file.filename}: {e}")
            continue

    return urls


async def upload_service_images(
    files: List[UploadFile],
    service_id: int,
    vendor_id: int
) -> List[str]:
    """Convenience wrapper for service images"""
    folder = f"vendors/{vendor_id}/services/{service_id}/images"
    return await upload_files(files, folder=folder, prefix="service-img")