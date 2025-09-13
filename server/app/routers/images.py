import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from supabase import create_client, Client
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.models.image import Image
from app.schemas import ImageCreate, ImageResponse

# ---------- settings ----------
from app.config import settings
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

# Fake auth for now – replace with real vendor auth
def require_vendor():
    return "vendor_123"

ALLOWED_MIME = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB

@router.post("/upload", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    vendor_id: str = Depends(require_vendor),
    venue_id: Optional[str] = None,
    service_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
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

    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(object_name)


    image_record = Image(
        url=public_url,
        venue_id=uuid.UUID(venue_id) if venue_id else None,
        service_id=uuid.UUID(service_id) if service_id else None,
    )
    db.add(image_record)
    db.commit()
    db.refresh(image_record)
    return image_record

@router.get("/img-url")
def transformed_image_url(path: str, w: int | None = None, h: int | None = None, q: int | None = None):
    transform = {}
    if w: transform["width"] = w
    if h: transform["height"] = h
    if q: transform["quality"] = q

    options = {"transform": transform} if transform else {}
    url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(path, options).get("data", {}).get("publicUrl")
    return {"url": url}


@router.get("/venue/{venue_id}", response_model=List[ImageResponse])
def list_images_for_venue(venue_id: str, db: Session = Depends(get_db)):
    try:
        vid = uuid.UUID(venue_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid venue ID")
    return db.query(Image).filter(Image.venue_id == vid).all()


@router.get("/service/{service_id}", response_model=List[ImageResponse])
def list_images_for_service(service_id: str, db: Session = Depends(get_db)):
    try:
        sid = uuid.UUID(service_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid service ID")
    return db.query(Image).filter(Image.service_id == sid).all()
