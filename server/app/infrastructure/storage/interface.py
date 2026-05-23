# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/storage/interface.py
# ─────────────────────────────────────────────────────────────────────────────
"""
Abstract storage interface. Business logic imports ONLY this.
Never import a concrete backend (supabase/s3) directly outside this package.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator
 
 
@dataclass
class UploadResult:
    key: str           # storage key / path inside bucket
    public_url: str    # CDN / public URL
    size_bytes: int
    checksum: str      # MD5 hex
 
 
class AbstractStorageBackend(ABC):
 
    @abstractmethod
    async def upload(
        self, key: str, data: bytes, content_type: str, checksum: str | None = None
    ) -> UploadResult: ...
 
    @abstractmethod
    async def upload_stream(
        self, key: str, stream: AsyncIterator[bytes], content_type: str, size_hint: int | None = None
    ) -> UploadResult: ...
 
    @abstractmethod
    async def download(self, key: str) -> bytes: ...
 
    @abstractmethod
    async def delete(self, key: str) -> None: ...
 
    @abstractmethod
    async def delete_batch(self, keys: list[str]) -> None: ...
 
    @abstractmethod
    async def copy(self, src_key: str, dst_key: str) -> UploadResult: ...
 
    @abstractmethod
    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str: ...
 
    @abstractmethod
    async def exists(self, key: str) -> bool: ...
 
    # Sync variants used inside Celery tasks (no event loop)
    def upload_sync(self, key: str, data: bytes, content_type: str) -> UploadResult:
        import asyncio
        return asyncio.run(self.upload(key, data, content_type))
 
    def copy_sync(self, src_key: str, dst_key: str) -> UploadResult:
        import asyncio
        return asyncio.run(self.copy(src_key, dst_key))
 
    def delete_sync(self, key: str) -> None:
        import asyncio
        asyncio.run(self.delete(key))
 
    def delete_batch_sync(self, keys: list[str]) -> None:
        import asyncio
        asyncio.run(self.delete_batch(keys))
 
    def download_sync(self, key: str) -> bytes:
        import asyncio
        return asyncio.run(self.download(key))