# ─────────────────────────────────────────────────────────────────────────────
# api/v1/admin/moderation.py
# ─────────────────────────────────────────────────────────────────────────────
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.session import get_db
from app.core.security import require_admin
from app.services.Admin.admin_moderation import ModerationService
from app.schemas.Admin.moderation import (
    ApproveRequest, RejectRequest, RollbackRequest, ModerationQueueResponse
)
from app.schemas.common import APIResponse
 
router = APIRouter(prefix="/admin/moderation", tags=["admin-moderation"])
 
 
@router.get("/queue", response_model=APIResponse[list[ModerationQueueResponse]])
async def get_moderation_queue(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    _admin=require_admin,
):
    svc = ModerationService(db)
    items = await svc.get_queue(page, page_size)
    return APIResponse(data=items)
 
 
@router.post("/approve/{version_id}", response_model=APIResponse[dict])
async def approve_version(
    version_id: int,
    body: ApproveRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin=require_admin,
):
    svc = ModerationService(db)
    version = await svc.approve(
        version_id=version_id,
        reviewer_id=current_admin["id"],
        notes=body.notes,
        request_ip=request.client.host if request.client else None,
    )
    return APIResponse(data={"version_id": version.id, "state": version.state})
 
 
@router.post("/reject/{version_id}", response_model=APIResponse[dict])
async def reject_version(
    version_id: int,
    body: RejectRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin=require_admin,
):
    svc = ModerationService(db)
    version = await svc.reject(
        version_id=version_id,
        reviewer_id=current_admin["id"],
        reason=body.reason,
        request_ip=request.client.host if request.client else None,
    )
    return APIResponse(data={"version_id": version.id, "state": version.state})
 
 
@router.post("/rollback/{service_id}", response_model=APIResponse[dict])
async def rollback_service(
    service_id: int,
    body: RollbackRequest,
    db: AsyncSession = Depends(get_db),
    current_admin=require_admin,
):
    svc = ModerationService(db)
    version = await svc.rollback(
        service_id=service_id,
        target_version_id=body.target_version_id,
        reviewer_id=current_admin["id"],
        reason=body.reason,
    )
    return APIResponse(data={"version_id": version.id, "state": version.state})
 
 
@router.get("/diff/{version_a_id}/{version_b_id}", response_model=APIResponse[dict])
async def version_diff(
    version_a_id: int,
    version_b_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=require_admin,
):
    svc = ModerationService(db)
    diff = await svc.get_diff(version_a_id, version_b_id)
    return APIResponse(data=diff)