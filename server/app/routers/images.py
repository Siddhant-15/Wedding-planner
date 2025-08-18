import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from supabase import create_client, Client
from pydantic_settings import BaseSettings

# ---------- settings ----------
class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_BUCKET: str = "product-images"

    class Config:
        env_file = ".env"

settings = Settings()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

# Fake auth for now – replace with real vendor auth
def require_vendor():
    return "vendor_123"

ALLOWED_MIME = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), vendor_id: str = Depends(require_vendor)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Only JPG/PNG/WebP allowed")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large")

    ext = ALLOWED_MIME[file.content_type]
    object_name = f"{vendor_id}/{uuid.uuid4().hex}{ext}"

    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        path=object_name,
        file=data,
        file_options={"content-type": file.content_type, "cache-control": "31536000", "upsert": "false"},
    )

    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(object_name).get("data", {}).get("publicUrl")

    # TODO: Save to your Postgres DB here if needed

    return {"path": object_name, "url": public_url}

@router.get("/img-url")
def transformed_image_url(path: str, w: int | None = None, h: int | None = None, q: int | None = None):
    transform = {}
    if w: transform["width"] = w
    if h: transform["height"] = h
    if q: transform["quality"] = q

    options = {"transform": transform} if transform else {}
    url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(path, options).get("data", {}).get("publicUrl")
    return {"url": url}
