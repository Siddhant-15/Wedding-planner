# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/storage/supabase.py
# ─────────────────────────────────────────────────────────────────────────────
import hashlib
from typing import AsyncIterator
from supabase import create_client, Client
from .interface import AbstractStorageBackend, UploadResult
 
 
class SupabaseStorageBackend(AbstractStorageBackend):
 
    def __init__(self, url: str, key: str, bucket: str):
        self._bucket = bucket
        self._client: Client = create_client(url, key)
        self._public_base = f"{url}/storage/v1/object/public/{bucket}"
 
    async def upload(self, key, data, content_type, checksum=None) -> UploadResult:
        md5 = hashlib.md5(data).hexdigest()
        self._client.storage.from_(self._bucket).upload(
            path=key,
            file=data,
            file_options={"content-type": content_type, "upsert": "false"},
        )
        return UploadResult(
            key=key,
            public_url=f"{self._public_base}/{key}",
            size_bytes=len(data),
            checksum=md5,
        )
 
    async def upload_stream(self, key, stream, content_type, size_hint=None) -> UploadResult:
        chunks: list[bytes] = []
        async for chunk in stream:
            chunks.append(chunk)
        return await self.upload(key, b"".join(chunks), content_type)
 
    async def download(self, key: str) -> bytes:
        return self._client.storage.from_(self._bucket).download(key)
 
    async def delete(self, key: str) -> None:
        self._client.storage.from_(self._bucket).remove([key])
 
    async def delete_batch(self, keys: list[str]) -> None:
        if keys:
            self._client.storage.from_(self._bucket).remove(keys)
 
    async def copy(self, src_key: str, dst_key: str) -> UploadResult:
        data = await self.download(src_key)
        # Supabase has no server-side copy; re-upload (use S3 adapter for scale)
        # For large files, use S3StorageBackend or presigned copy
        import mimetypes
        ct, _ = mimetypes.guess_type(dst_key)
        return await self.upload(dst_key, data, ct or "application/octet-stream")
 
    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        result = self._client.storage.from_(self._bucket).create_signed_url(key, expires_in)
        if isinstance(result, dict):
            return result.get("signedURL") or result.get("signedUrl", "")
        return str(result)
 
    async def exists(self, key: str) -> bool:
        try:
            self._client.storage.from_(self._bucket).download(key)
            return True
        except Exception:
            return False