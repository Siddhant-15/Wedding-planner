from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.service_view_repository import ServiceViewRepository
from app.schemas.customer.service_view import ServiceViewResponse


class ServiceViewController:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = ServiceViewRepository(db)

    async def track_view(
        self,
        service_id: int,
        current_user: Optional[dict] = None,
        visitor_id: Optional[UUID] = None,
    ) -> ServiceViewResponse:
        """
        Track a public service view.

        - Customer → tracked using customer_id
        - Guest → tracked using visitor_id
        - Vendor → not tracked
        """

        # 1. Ensure the service is publicly available
        service = await self.repository.get_public_service(service_id)

        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found or not publicly available",
            )

        # 2. Vendors are not customer views.
        # We intentionally don't count them in public service analytics.
        if current_user and current_user["role"] == "vendor":
            return ServiceViewResponse(
                tracked=False,
                message="Vendor views are not tracked",
            )

        # 3. Authenticated customer
        if current_user and current_user["role"] == "customer":
            customer_id = current_user["id"]

            already_viewed = (
                await self.repository.has_recent_customer_view(
                    service_id=service_id,
                    customer_id=customer_id,
                )
            )

            if already_viewed:
                return ServiceViewResponse(
                    tracked=False,
                    message="View already recorded recently",
                )

            await self.repository.create_view(
                service_id=service_id,
                customer_id=customer_id,
            )

        # 4. Anonymous visitor
        else:
            if visitor_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="visitor_id is required for anonymous visitors",
                )

            already_viewed = (
                await self.repository.has_recent_anonymous_view(
                    service_id=service_id,
                    visitor_id=visitor_id,
                )
            )

            if already_viewed:
                return ServiceViewResponse(
                    tracked=False,
                    message="View already recorded recently",
                )

            await self.repository.create_view(
                service_id=service_id,
                visitor_id=visitor_id,
            )

        # Controller owns the transaction
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return ServiceViewResponse(
            tracked=True,
            message="Service view tracked successfully",
        )