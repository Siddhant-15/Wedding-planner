from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user
from app.controller.Customer.customer_services_controller import CustomerServiceController 
from app.schemas.Customer.customer_services import ServiceDetailResponse

customerservicerouter = APIRouter()


@customerservicerouter.get("/{service_type}/list")
async def get_service_cards(
    service_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=50),
    city: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    services, total = await CustomerServiceController.list_services(
        db, service_type, skip, limit, city
    )

    return {
        "services": services,
        "total_count": total,
        "user_role": current_user.get("role") if current_user else None
    }


@customerservicerouter.get(
    "/services/detail/{service_id}",
    response_model=ServiceDetailResponse
)
async def get_service_detail(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = await CustomerServiceController.get_service_detail(db, service_id)

    if not service:
        return {"detail": "Service not found"}

    # mapping can stay here OR move to mapper later
    return await CustomerServiceController.map_service_detail(db, service)


@customerservicerouter.get("/services/{service_id}/media")
async def get_service_media(
    service_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, le=30),
    db: AsyncSession = Depends(get_db),
):
    return await CustomerServiceController.get_service_media(db, service_id, skip, limit)