from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.controller.vendor.dashboard_controller import (
    VendorDashboardController,
)
from app.db.db import get_db
from app.models.models import Vendor
from app.schemas.vendor.dashboard import (
    VendorDashboardKPIsResponse,
)

# Replace this import with your actual authentication dependency
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/vendor/dashboard",
    tags=["Vendor Dashboard"],
)


@router.get(
    "/kpis",
    response_model=VendorDashboardKPIsResponse,
)
async def get_vendor_dashboard_kpis(
    db: AsyncSession = Depends(get_db),
    current_vendor: dict = Depends(get_current_user),
):
    """
    Get dashboard KPI summary for the authenticated vendor.
    """

    return await VendorDashboardController.get_dashboard_kpis(
        db=db,
        vendor_id=current_vendor["id"],
    )