# ─────────────────────────────────────────────────────────────────────────────
# infrastructure/storage/validation.py
# ─────────────────────────────────────────────────────────────────────────────
"""
File validation before any upload is attempted.
Uses python-magic to detect real content type from bytes, not filename.
"""
import hashlib
import magic
from fastapi import UploadFile, HTTPException
 
ALLOWED_IMAGE_MIMES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
ALLOWED_VIDEO_MIMES: set[str] = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
}
BLOCKED_EXTENSIONS: set[str] = {
    "exe", "sh", "bat", "cmd", "ps1", "php", "py",
    "js", "ts", "rb", "pl", "jar", "dll", "so",
}
 
MAX_IMAGE_BYTES: int = 15 * 1024 * 1024   # 15 MB
MAX_VIDEO_BYTES: int = 200 * 1024 * 1024  # 200 MB
 
 
async def validate_and_read_file(
    file: UploadFile,
    allowed_mimes: set[str],
    max_bytes: int,
) -> tuple[bytes, str, str]:
    """
    Returns (data_bytes, detected_content_type, md5_checksum).
    Raises HTTPException on any violation.
    """
    # Guard against path traversal in filename
    filename = file.filename or "upload"
    if any(c in filename for c in ["/", "\\", "..", "\x00", "\r", "\n"]):
        raise HTTPException(400, "Invalid filename characters")
 
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in BLOCKED_EXTENSIONS:
        raise HTTPException(415, f"File extension '.{ext}' is not allowed")
 
    # Read entire file — streaming size check
    chunks: list[bytes] = []
    total = 0
    async for chunk in file.__aiter__():  # type: ignore[attr-defined]
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(413, f"File too large. Max: {max_bytes // (1024 * 1024)} MB")
        chunks.append(chunk)
 
    data = b"".join(chunks)
    if not data:
        raise HTTPException(400, "Empty file is not allowed")
 
    # Detect REAL content type from magic bytes
    detected = magic.from_buffer(data[:8192], mime=True)
    if detected not in allowed_mimes:
        raise HTTPException(
            415,
            f"File type not permitted. Detected: '{detected}'. "
            f"Allowed: {sorted(allowed_mimes)}",
        )
 
    checksum = hashlib.md5(data).hexdigest()
    return data, detected, checksum