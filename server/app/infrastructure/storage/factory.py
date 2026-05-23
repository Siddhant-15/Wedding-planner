# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/storage/factory.py
# ─────────────────────────────────────────────────────────────────────────────
from functools import lru_cache
from .interface import AbstractStorageBackend
 
 
@lru_cache(maxsize=1)
def get_storage_backend() -> AbstractStorageBackend:
    """
    Config-driven provider selection.
    Set STORAGE_PROVIDER env var to: supabase | s3 | r2 | spaces | minio
    """
    from app.core.config import settings
 
    match settings.STORAGE_PROVIDER:
        case "supabase":
            from .supabase import SupabaseStorageBackend
            return SupabaseStorageBackend(
                url=settings.SUPABASE_URL,
                key=settings.SUPABASE_SERVICE_KEY,
                bucket=settings.STORAGE_BUCKET,
            )
        case "s3" | "r2" | "spaces" | "minio":
            from .s3 import S3StorageBackend
            return S3StorageBackend(
                bucket=settings.STORAGE_BUCKET,
                access_key=settings.S3_ACCESS_KEY,
                secret_key=settings.S3_SECRET_KEY,
                region=settings.S3_REGION,
                endpoint_url=settings.S3_ENDPOINT_URL or None,
                public_base_url=settings.CDN_BASE or None,
            )
        case _:
            raise ValueError(f"Unknown STORAGE_PROVIDER: {settings.STORAGE_PROVIDER}")
 
 
# FastAPI Depends() injection target
def storage_dep() -> AbstractStorageBackend:
    return get_storage_backend()