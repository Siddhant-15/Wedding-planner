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
    data: str = Form(..., description="JSON-encoded ServiceCreate payload"),
    images: List[UploadFile] = File(default=[], description="Image uploads"),
    image_is_cover: List[bool] = Form(
        default=[],
        description="Cover flag corresponding to each uploaded image"
    ),
    external_media: str = Form(default="[]", description="JSON list of external media objects"),
    save_as_draft: str = Form(default="false", description="true = draft, false = submit for review"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await create_service_controller(
        data=data,
        images=images,
        image_is_cover=image_is_cover,
        external_media=external_media,
        save_as_draft=save_as_draft,
        db=db,
        current_user=current_user,
    )


@router.get(
    "/get-all",
    response_model=List[ServiceResponse],
    summary="List all services for the authenticated vendor",
)
async def get_all_services(
    db: AsyncSession = Depends(get_db),
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
    db: AsyncSession = Depends(get_db),
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
    data: str = Form(..., description="JSON-encoded ServiceCreate payload"),
    # CRITICAL: default None — not "[]". Omission means keep all media.
    existing_media: Optional[str] = Form(
        default=None,
        description=(
            'JSON list of media to retain: [23, 24] or '
            '[{"id": 23, "is_cover": true}, {"id": 24, "is_cover": false}]. '
            'Omit = keep all. "[]" = clear all.'
        ),
    ),
    images: List[UploadFile] = File(default=[], description="New image uploads"),
    image_is_cover: List[bool] = Form(
        default=[],
        description="Cover flag for each NEW image in `images`, same order. Max 5 covers per service in total.",
    ),
    videos: List[UploadFile] = File(default=[], description="New video uploads"),
    external_media: str = Form(default="[]", description="JSON list of external media objects"),
    save_as_draft: str = Form(default="false", description="true = draft, false = submit for review"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await update_service_controller(
        service_id=id,
        data=data,
        existing_media=existing_media,
        images=images,
        videos=videos,
        external_media=external_media,
        save_as_draft=save_as_draft,
        db=db,
        current_user=current_user,
        image_is_cover=image_is_cover,
    )


@router.delete(
    "/delete/{id}",
    status_code=200,
    summary="Soft-delete a service (sets deleted_at, preserves data)",
)
async def delete_service(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await delete_service_controller(
        service_id=id,
        db=db,
        current_user=current_user,
    )