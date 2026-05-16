import mimetypes
from uuid import uuid4
from app.utils.supabase_client import supabase


async def upload_file(file) -> str:
    file_bytes = await file.read()

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    file_path = f"services/{uuid4().hex}.{ext}"

    content_type, _ = mimetypes.guess_type(file.filename)
    content_type = content_type or "application/octet-stream"

    supabase.storage.from_("service-images").upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": content_type}
    )

    url = supabase.storage.from_("service-images").get_public_url(file_path)

    return url.get("publicURL") if isinstance(url, dict) else str(url)