from uuid import uuid4
import mimetypes

from app.utils.supabase_client import supabase


async def _upload_media(img):
    file_bytes = await img.read()

    ext = img.filename.split(".")[-1] if "." in img.filename else "jpg"

    file_path = f"services/{uuid4().hex}.{ext}"

    content_type, _ = mimetypes.guess_type(img.filename)

    content_type = content_type or "application/octet-stream"

    supabase.storage.from_("service-images").upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": content_type}
    )

    public_url = supabase.storage.from_("service-images").get_public_url(file_path)

    return (
        public_url.get("publicURL")
        if isinstance(public_url, dict)
        else str(public_url)
    )