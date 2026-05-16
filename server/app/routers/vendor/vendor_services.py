from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user
from app.controller.Vendor.vendor_services_controller import ServicesController

router = APIRouter(prefix="/services", tags=["services"])


@router.post("/create")
async def create_service(
    data: str = Form(...),
    images: list[UploadFile] = File([]),
    videos: list[UploadFile] = File([]),
    image_meta: str = Form("[]"),
    external_media: str = Form("[]"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await ServicesController.create(
        db, current_user, data, images, videos, image_meta, external_media
    )


@router.get("/get-all")
async def get_all(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    return await ServicesController.get_all(db, current_user["email"])


@router.get("/{service_id}")
async def get_one(service_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    return await ServicesController.get_one(db, service_id, current_user["email"])


@router.put("/update/{service_id}")
async def update(service_id: int, data: str = Form(...), db=Depends(get_db), current_user=Depends(get_current_user)):
    return await ServicesController.update(db, service_id, current_user["email"], data)


@router.delete("/delete/{service_id}")
async def delete(service_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await ServicesController.delete(db, service_id, current_user["email"])