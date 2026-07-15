"""
app/routers/services.py

Vendor-facing service endpoints.
API surface is identical to the pre-versioning router — no frontend changes needed.

Routes:
  POST   /services/create          → create_service_controller
  GET    /services/get-all         → get_all_services_controller
  GET    /services/{id}            → get_service_controller
  PUT    /services/update/{id}     → update_service_controller
  DELETE /services/delete/{id}     → delete_service_controller  (soft delete)
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.controller.vendor.service_controller import (
    create_service_controller,
    delete_service_controller,
    get_all_services_controller,
    get_service_controller,
    update_service_controller,
)
from app.schemas.services import ServiceCreateResponse, ServiceResponse

router = APIRouter(prefix="/services", tags=["services"])


@router.post(
    "/create",
    response_model=ServiceCreateResponse,
    status_code=201,
    summary="Create a new service (vendor)",
)
async def create_service(
    data: str                          = Form(..., description="JSON-encoded ServiceCreate payload"),
    images: List[UploadFile]           = File(default=[], description="Image uploads"),
    external_media: str                = Form(default="[]", description="JSON list of external media objects"),
    db: AsyncSession                   = Depends(get_db),
    current_user: dict                 = Depends(get_current_user),
):
    return await create_service_controller(
        data=data,
        images=images,
        external_media=external_media,
        db=db,
        current_user=current_user,
    )


@router.get(
    "/get-all",
    response_model=List[ServiceResponse],
    summary="List all services for the authenticated vendor",
)
async def get_all_services(
    db: AsyncSession   = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await get_all_services_controller(db=db, current_user=current_user)


@router.get(
    "/{id}",
    response_model=ServiceResponse,
    summary="Get a single service by ID",
)
async def get_service(
    id: int,
    db: AsyncSession   = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await get_service_controller(service_id=id, db=db, current_user=current_user)


@router.put(
    "/update/{id}",
    response_model=ServiceCreateResponse,
    summary="Update a service (creates a new draft version if currently live)",
)
async def update_service(
    id: int,
    data: str                          = Form(..., description="JSON-encoded ServiceCreate payload"),
    existing_media: str                = Form(default="[]", description="JSON list of media IDs to retain"),
    images: List[UploadFile]           = File(default=[], description="New image uploads"),
    videos: List[UploadFile]           = File(default=[], description="New video uploads"),
    external_media: str                = Form(default="[]", description="JSON list of external media objects"),
    db: AsyncSession                   = Depends(get_db),
    current_user: dict                 = Depends(get_current_user),
):
    return await update_service_controller(
        service_id=id,
        data=data,
        existing_media=existing_media,
        images=images,
        videos=videos,
        external_media=external_media,
        db=db,
        current_user=current_user,
    )


@router.delete(
    "/delete/{id}",
    status_code=200,
    summary="Soft-delete a service (sets deleted_at, preserves data)",
)
async def delete_service(
    id: int,
    db: AsyncSession   = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await delete_service_controller(
        service_id=id,
        db=db,
        current_user=current_user,
    )