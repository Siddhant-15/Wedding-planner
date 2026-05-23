# tests/test_service_create.py
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_create_service_atomic_rollback(async_client: AsyncClient, mock_storage):
    """If DB commit fails after temp uploads, temp files must be cleaned."""
    mock_storage.upload = AsyncMock(return_value=UploadResult(...))
    mock_storage.delete_batch = AsyncMock()

    with patch("app.infrastructure.db.session.AsyncSessionLocal") as mock_db:
        mock_db.return_value.__aenter__.return_value.commit.side_effect = Exception("DB down")

        response = await async_client.post("/api/v1/services/create", ...)

    assert response.status_code == 500
    mock_storage.delete_batch.assert_called_once()  # temp files cleaned


@pytest.mark.asyncio
async def test_idempotent_create(async_client: AsyncClient):
    idem_key = "test-key-123"
    r1 = await async_client.post("/api/v1/services/create", ..., headers={"Idempotency-Key": idem_key})
    r2 = await async_client.post("/api/v1/services/create", ..., headers={"Idempotency-Key": idem_key})

    assert r1.json()["data"]["service_id"] == r2.json()["data"]["service_id"]
    assert r2.headers.get("X-Idempotent-Replayed") == "true"


@pytest.mark.asyncio
async def test_moderation_invalid_transition():
    from app.infrastructure.db.models.service_version import assert_valid_transition, VersionState
    with pytest.raises(ValueError):
        assert_valid_transition(VersionState.draft, VersionState.published)