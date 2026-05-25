from fastapi import APIRouter, Depends, Form, File, UploadFile
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user
from app.controller.Vendor.service_controller import (
    create_service_controller,
    get_all_services_controller,
    get_service_controller,
    update_service_controller,
    delete_service_controller,
)

from app.schemas.services import (
    ServiceResponse,
    ServiceCreateResponse,
)

router = APIRouter(prefix="/services", tags=["services"])


@router.post("/create", response_model=ServiceCreateResponse, status_code=201)
async def create_service(
    data: str = Form(...),
    images: List[UploadFile] = File([]),
    external_media: str = Form("[]"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await create_service_controller(
        data,
        images,
        external_media,
        db,
        current_user
    )


@router.get("/get-all", response_model=List[ServiceResponse])
async def get_all_services(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await get_all_services_controller(db, current_user)


@router.get("/{id}", response_model=ServiceResponse)
async def get_service(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await get_service_controller(id, db, current_user)


@router.put("/update/{id}", response_model=ServiceCreateResponse)
async def update_service(
    id: int,
    data: str = Form(...),
    existing_media: str = Form("[]"),
    images: List[UploadFile] = File([]),
    videos: List[UploadFile] = File([]),
    external_media: str = Form("[]"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await update_service_controller(
        id,
        data,
        existing_media,
        images,
        videos,
        external_media,
        db,
        current_user
    )


@router.delete("/delete/{id}", status_code=204)
async def delete_service(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await delete_service_controller(id, db, current_user)