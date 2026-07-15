"""
app/repositories/Vendor/service_repository.py

All DB read queries for vendor-facing service operations.

Schema overview:
  Service
    ├── current_draft_version  → ServiceVersion (draft)
    └── current_live_version   → ServiceVersion (published)

Every ServiceVersion carries:
  ├── variants       (service_version_id FK)
  ├── media          (service_version_id FK)
  └── <type>_detail  (service_version_id FK, one of six detail tables)

We always eager-load BOTH version pointers so the helper layer can
decide which one to surface (draft preferred, live as fallback).
"""

from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.models import (
    Service,
    ServiceVersion,
    Vendor,
)

logger = logging.getLogger(__name__)


# =============================================================================
# EAGER-LOAD OPTION BUILDERS
# =============================================================================

def _detail_opts(version_attr) -> list:
    """
    Build a list of sub-options for one version relationship attribute.
    Loads the six type-detail tables, plus variants and media, all hanging
    off the given version attribute (e.g. Service.current_draft_version).
    """
    return [
        joinedload(version_attr).joinedload(ServiceVersion.venue_detail),
        joinedload(version_attr).joinedload(ServiceVersion.catering_detail),
        joinedload(version_attr).joinedload(ServiceVersion.dj_detail),
        joinedload(version_attr).joinedload(ServiceVersion.photography_detail),
        joinedload(version_attr).joinedload(ServiceVersion.event_management_detail),
        joinedload(version_attr).joinedload(ServiceVersion.makeup_artist_detail),
        # selectinload avoids cartesian explosion for collections
        joinedload(version_attr).selectinload(ServiceVersion.variants),
        joinedload(version_attr).selectinload(ServiceVersion.media),
    ]


# Build once at import time
_ALL_OPTS: list = [
    # top-level version joins
    joinedload(Service.current_draft_version),
    joinedload(Service.current_live_version),
    # availability dates (service-level, not version-level)
    selectinload(Service.unavailable_dates),
    # drill into draft version children
    *_detail_opts(Service.current_draft_version),
    # drill into live version children
    *_detail_opts(Service.current_live_version),
]


# =============================================================================
# HELPERS
# =============================================================================

async def get_vendor_id(db: AsyncSession, email: str) -> Optional[int]:
    """Return vendor PK for the given email, or None if not found."""
    result = await db.execute(
        select(Vendor.id).where(
            Vendor.email == email,
            Vendor.deleted_at.is_(None),
        )
    )
    return result.scalar_one_or_none()


# =============================================================================
# PUBLIC QUERY FUNCTIONS
# =============================================================================

async def get_all_vendor_services(
    db: AsyncSession,
    current_user: dict,
) -> List[Service]:
    """
    Return all non-soft-deleted services owned by the authenticated vendor,
    with both version pointers and their children fully loaded.
    """
    vendor_id = await get_vendor_id(db, current_user["email"])
    if not vendor_id:
        return []

    result = await db.execute(
        select(Service)
        .where(
            Service.vendor_id == vendor_id,
            Service.deleted_at.is_(None),
        )
        .options(*_ALL_OPTS)
        .order_by(Service.created_at.desc())
    )
    return result.scalars().unique().all()


async def get_service_with_relations(
    service_id: int,
    db: AsyncSession,
    current_user: dict,
) -> Optional[Service]:
    """
    Return a single service (with all relations loaded) for the authenticated
    vendor.  Returns None when not found, soft-deleted, or owned by another vendor.
    """
    vendor_id = await get_vendor_id(db, current_user["email"])
    if not vendor_id:
        return None

    result = await db.execute(
        select(Service)
        .where(
            Service.id == service_id,
            Service.vendor_id == vendor_id,
            Service.deleted_at.is_(None),
        )
        .options(*_ALL_OPTS)
    )
    return result.unique().scalar_one_or_none()