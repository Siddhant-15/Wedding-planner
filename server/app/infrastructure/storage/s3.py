# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/storage/s3.py
# ─────────────────────────────────────────────────────────────────────────────
"""
S3-compatible backend. Works with:
  - AWS S3        (endpoint_url=None, region=us-east-1)
  - Cloudflare R2 (endpoint_url=https://<account>.r2.cloudflarestorage.com)
  - DigitalOcean  (endpoint_url=https://<region>.digitaloceanspaces.com)
  - MinIO         (endpoint_url=http://minio:9000)
"""
import hashlib
import aioboto3
from .interface import AbstractStorageBackend, UploadResult
 
 
class S3StorageBackend(AbstractStorageBackend):
 
    def __init__(
        self,
        bucket: str,
        access_key: str,
        secret_key: str,
        region: str,
        endpoint_url: str | None = None,
        public_base_url: str | None = None,
    ):
        self._bucket = bucket
        self._endpoint = endpoint_url
        self._public_base = public_base_url or f"https://{bucket}.s3.{region}.amazonaws.com"
        self._session = aioboto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
 
    def _client(self):
        kwargs = {"service_name": "s3"}
        if self._endpoint:
            kwargs["endpoint_url"] = self._endpoint
        return self._session.client(**kwargs)
 
    async def upload(self, key, data, content_type, checksum=None) -> UploadResult:
        md5 = hashlib.md5(data).hexdigest()
        async with self._client() as s3:
            await s3.put_object(
                Bucket=self._bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
                Metadata={"checksum": md5},
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
        async with self._client() as s3:
            resp = await s3.get_object(Bucket=self._bucket, Key=key)
            return await resp["Body"].read()
 
    async def delete(self, key: str) -> None:
        async with self._client() as s3:
            await s3.delete_object(Bucket=self._bucket, Key=key)
 
    async def delete_batch(self, keys: list[str]) -> None:
        if not keys:
            return
        async with self._client() as s3:
            await s3.delete_objects(
                Bucket=self._bucket,
                Delete={"Objects": [{"Key": k} for k in keys]},
            )
 
    async def copy(self, src_key: str, dst_key: str) -> UploadResult:
        async with self._client() as s3:
            await s3.copy_object(
                Bucket=self._bucket,
                CopySource={"Bucket": self._bucket, "Key": src_key},
                Key=dst_key,
            )
            head = await s3.head_object(Bucket=self._bucket, Key=dst_key)
        return UploadResult(
            key=dst_key,
            public_url=f"{self._public_base}/{dst_key}",
            size_bytes=head["ContentLength"],
            checksum=head.get("Metadata", {}).get("checksum", ""),
        )
 
    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        async with self._client() as s3:
            return await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self._bucket, "Key": key},
                ExpiresIn=expires_in,
            )
 
    async def exists(self, key: str) -> bool:
        try:
            async with self._client() as s3:
                await s3.head_object(Bucket=self._bucket, Key=key)
            return True
        except Exception:
            return False