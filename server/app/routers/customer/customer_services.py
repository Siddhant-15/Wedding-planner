from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db

from app.core.security import get_current_user_optional

from app.controller.Customer.customer_services_controller import (
    CustomerServiceController,
)

from app.schemas.Customer.customer_services import (
    ServiceDetailResponse,
)

router = APIRouter(
    prefix="/customer",
    tags=["customer-services"],
)


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE LIST
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{service_type}/list")
async def get_service_cards(
    service_type: str,

    skip: int = Query(0, ge=0),

    limit: int = Query(12, ge=1, le=50),

    city: str | None = Query(default=None),

    db: AsyncSession = Depends(get_db),

    current_user=Depends(get_current_user_optional),
):

    services, total = (
        await CustomerServiceController.list_services(
            db=db,
            service_type=service_type,
            skip=skip,
            limit=limit,
            city=city,
        )
    )

    return {
        "success": True,
        "services": services,
        "total_count": total,
        "user_role": (
            current_user.get("role")
            if current_user
            else None
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE DETAIL
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/services/detail/{service_id}",
    response_model=ServiceDetailResponse,
)
async def get_service_detail(
    service_id: int,

    db: AsyncSession = Depends(get_db),
):

    service = await (
        CustomerServiceController.get_service_detail(
            db,
            service_id,
        )
    )

    if not service:
        return {
            "success": False,
            "detail": "Service not found",
        }

    return await CustomerServiceController.map_service_detail(
        db,
        service,
    )


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE MEDIA
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/services/{service_id}/media")
async def get_service_media(
    service_id: int,

    skip: int = Query(0, ge=0),

    limit: int = Query(12, ge=1, le=30),

    db: AsyncSession = Depends(get_db),
):

    return await CustomerServiceController.get_service_media(
        db=db,
        service_id=service_id,
        skip=skip,
        limit=limit,
    )