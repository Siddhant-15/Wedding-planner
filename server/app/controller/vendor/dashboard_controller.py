from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.vendor.dashboard_repository import (
    VendorDashboardRepository,
)
from app.schemas.vendor.dashboard import (
    VendorDashboardKPIsResponse,
)


class VendorDashboardController:

    @staticmethod
    async def get_dashboard_kpis(
        db: AsyncSession,
        vendor_id: int,
    ) -> VendorDashboardKPIsResponse:

        data = await VendorDashboardRepository.get_kpis(
            db=db,
            vendor_id=vendor_id,
        )

        return VendorDashboardKPIsResponse(
            **data,
        )