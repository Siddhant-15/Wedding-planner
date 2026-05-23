from typing import List
import json

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db

from app.core.security import (
    require_vendor,
    assert_service_owner,
)

from app.infrastructure.storage.factory import storage_dep

from app.controller.Vendor.vendor_services_controller import (
    ServicesController,
)

from app.schemas.Vendor.vendor_services import (
    ServiceCreate,
    ServiceUpdate,
)

from app.schemas.common import APIResponse


router = APIRouter(
    prefix="/services",
    tags=["vendor-services"],
)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def parse_json_field(value: str, field_name: str):
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON in '{field_name}'",
        )


# ─────────────────────────────────────────────────────────────────────────────
# CREATE SERVICE
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
async def create_service(
    data: str = Form(...),

    media: str = Form(default="[]"),

    idempotency_key: str = Header(
        ...,
        alias="Idempotency-Key",
    ),

    db: AsyncSession = Depends(get_db),

    current_user=Depends(require_vendor),
):
    """
    Create vendor service.

    Media already uploaded by frontend.
    Backend only stores URLs.
    """

    parsed_data = parse_json_field(
        data,
        "data",
    )

    parsed_media = parse_json_field(
        media,
        "media",
    )

    parsed = ServiceCreate(
        **parsed_data
    )

    result = await ServicesController.create(
        db=db,

        current_user=current_user,

        parsed=parsed,

        media=parsed_media,

        idempotency_key=idempotency_key,
    )

    return APIResponse(
        success=True,
        message="Service submitted for review",
        data=result,
    )


# ─────────────────────────────────────────────────────────────────────────────
# UPDATE SERVICE
# ─────────────────────────────────────────────────────────────────────────────

@router.put(
    "/{service_id}",
    status_code=status.HTTP_200_OK,
)
async def update_service(
    service_id: int,

    data: str = Form(...),

    media: str = Form(default="[]"),

    idempotency_key: str = Header(
        ...,
        alias="Idempotency-Key",
    ),

    db: AsyncSession = Depends(get_db),

    current_user=Depends(require_vendor),
):
    """
    Update service.

    Frontend uploads media directly and sends final URLs.

    Supports:
    - existing media
    - uploaded images/videos
    - youtube/vimeo/external urls
    """

    await assert_service_owner(
        service_id=service_id,
        vendor_id=current_user.vendor_id,
        db=db,
    )

    parsed_data = parse_json_field(
        data,
        "data",
    )

    parsed_media = parse_json_field(
        media,
        "media",
    )

    parsed = ServiceUpdate(
        **parsed_data
    )

    result = await ServicesController.update(
        db=db,

        service_id=service_id,

        current_user=current_user,

        parsed=parsed,

        media=parsed_media,

        idempotency_key=idempotency_key,
    )

    return APIResponse(
        success=True,
        message="Service update submitted for moderation",
        data=result,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET MY SERVICES
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/my")
async def get_my_services(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_vendor),
):
    result = await ServicesController.get_all(
        db=db,
        email=current_user["email"],
    )

    return APIResponse(
        success=True,
        message="Services fetched successfully",
        data=result,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET SINGLE SERVICE
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{service_id}")
async def get_service(
    service_id: int,

    db: AsyncSession = Depends(get_db),

    current_user=Depends(require_vendor),
):
    await assert_service_owner(
        service_id=service_id,
        vendor_id=current_user["id"],
        db=db,
    )

    result = await ServicesController.get_one(
        db=db,
        service_id=service_id,
        email=current_user["email"],
    )

    return APIResponse(
        success=True,
        message="Service fetched successfully",
        data=result,
    )


# ─────────────────────────────────────────────────────────────────────────────
# DELETE SERVICE
# ─────────────────────────────────────────────────────────────────────────────

@router.delete(
    "/{service_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_service(
    service_id: int,

    db: AsyncSession = Depends(get_db),

    current_user=Depends(require_vendor),
):
    await assert_service_owner(
        service_id=service_id,
        vendor_id=current_user["id"],
        db=db,
    )

    result = await ServicesController.delete(
        db=db,
        service_id=service_id,
        email=current_user["email"],
    )

    return APIResponse(
        success=True,
        message="Service deleted successfully",
        data=result,
    )