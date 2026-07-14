"""
app/utils/Admin/service_review_helpers.py

Helper functions for building admin-facing service response objects.
Reuses the vendor-side _jsonb_list / _col_dict utilities but adds
version-history projection and vendor snapshot fields.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from app.models.models import Service, ServiceVersion

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-level utilities
# ---------------------------------------------------------------------------

def _jsonb_list(val) -> list:
    if isinstance(val, dict):
        return list(val.values())
    return val or []


def _col_dict(row, exclude: Optional[set] = None) -> Dict[str, Any]:
    """Dump SQLAlchemy column values → plain dict, skipping excluded names."""
    exclude = exclude or set()
    return {
        col.name: getattr(row, col.name)
        for col in row.__table__.columns
        if col.name not in exclude
    }


# ---------------------------------------------------------------------------
# Version selector
# ---------------------------------------------------------------------------

def _review_version(service: Service) -> Optional[ServiceVersion]:
    """
    For admin purposes we always prefer the draft (= the one awaiting review).
    Fall back to live if no draft exists.
    """
    return service.current_draft_version or service.current_live_version


# ---------------------------------------------------------------------------
# Type-specific detail projectors
# ---------------------------------------------------------------------------

_SKIP = {"service_version_id"}


def _project_venue(ver: ServiceVersion, service_id: int) -> Optional[dict]:
    if not ver or not ver.venue_detail:
        return None
    row = ver.venue_detail
    data = _col_dict(row, _SKIP)
    data["service_id"]    = service_id
    data["venue_policies"] = row.venue_policies or {
        "decoration_policy": "",
        "catering_policy":   "",
        "alcohol_policy":    "",
        "other_policies":    [],
    }
    return data


def _project_catering(ver: ServiceVersion, service_id: int) -> Optional[dict]:
    if not ver or not ver.catering_detail:
        return None
    row = ver.catering_detail
    data = _col_dict(row, _SKIP)
    data["service_id"]              = service_id
    data["cuisine_types"]           = _jsonb_list(row.cuisine_types)
    data["meal_types"]              = _jsonb_list(row.meal_types)
    data["service_styles"]          = _jsonb_list(row.service_styles)
    data["special_diets_supported"] = _jsonb_list(row.special_diets_supported)
    return data


def _project_dj(ver: ServiceVersion, service_id: int) -> Optional[dict]:
    if not ver or not ver.dj_detail:
        return None
    row = ver.dj_detail
    data = _col_dict(row, _SKIP)
    data["service_id"]            = service_id
    data["genres_supported"]      = _jsonb_list(row.genres_supported)
    data["languages_supported"]   = _jsonb_list(row.languages_supported)
    data["event_types_supported"] = row.event_types_supported or []
    data["equipments_provided"]   = _jsonb_list(row.equipments_provided)
    return data


def _project_photography(ver: ServiceVersion, service_id: int) -> Optional[dict]:
    if not ver or not ver.photography_detail:
        return None
    row = ver.photography_detail
    data = _col_dict(row, _SKIP)
    data["service_id"]        = service_id
    data["photography_types"] = _jsonb_list(row.photography_types)
    data["editing_styles"]    = _jsonb_list(row.editing_styles)
    return data


def _project_event_management(ver: ServiceVersion, service_id: int) -> Optional[dict]:
    if not ver or not ver.event_management_detail:
        return None
    row = ver.event_management_detail
    data = _col_dict(row, _SKIP)
    data["service_id"]            = service_id
    data["event_types_supported"] = _jsonb_list(row.event_types_supported)
    data["services_offered"]      = _jsonb_list(row.services_offered)
    data["themes_supported"]      = _jsonb_list(row.themes_supported)
    return data


def _project_makeup(ver: ServiceVersion, service_id: int) -> Optional[dict]:
    if not ver or not ver.makeup_artist_detail:
        return None
    row = ver.makeup_artist_detail
    data = _col_dict(row, _SKIP)
    data["service_id"]   = service_id
    data["makeup_types"] = _jsonb_list(row.makeup_types)
    data["brands_used"]  = _jsonb_list(row.brands_used)
    return data


# ---------------------------------------------------------------------------
# Collection projectors
# ---------------------------------------------------------------------------

def _project_variants(ver: ServiceVersion, service_id: int) -> List[dict]:
    if not ver:
        return []
    out = []
    for v in ver.variants:
        row = _col_dict(v, _SKIP)
        row["service_id"]   = service_id
        row["inclusions"]   = v.inclusions or []
        row["exclusions"]   = v.exclusions or []
        row["menu"]         = _jsonb_list(v.menu)
        row["deliverables"] = _jsonb_list(v.deliverables)
        row["metadata"]     = v.metadata_ or {}
        out.append(row)
    return out


def _project_media(ver: ServiceVersion, service_id: int) -> List[dict]:
    if not ver:
        return []
    out = []
    for m in ver.media:
        row = _col_dict(m, _SKIP)
        row["service_id"] = service_id
        row["metadata"]   = m.metadata_ or {}
        out.append(row)
    return out


def _project_version_history(service: Service) -> List[dict]:
    """All versions sorted latest-first."""
    versions = sorted(service.versions or [], key=lambda v: v.version_number, reverse=True)
    return [
        {
            "version_id":      v.id,
            "version_number":  v.version_number,
            "version_status":  v.status,
            "service_name":    v.service_name,
            "city":            v.city,
            "state":           v.state,
            "submitted_at":    v.submitted_at,
            "reviewed_at":     v.reviewed_at,
            "approved_at":     v.approved_at,
            "rejected_at":     v.rejected_at,
            "rejection_reason": v.rejection_reason,
        }
        for v in versions
    ]


# ---------------------------------------------------------------------------
# Public builders
# ---------------------------------------------------------------------------

def build_service_card(service: Service) -> dict:
    version = (
        service.current_draft_version
        or service.current_live_version
    )

    vendor = service.vendor

    cover_image = None

    if version and version.media:
        cover_image = next(
            (
                media.media_url
                for media in version.media
                if media.is_cover
            ),
            None,
        )

    return {
        "id": service.id,

        "name": (
            version.service_name
            if version
            else None
        ),

        "category": (
            service.service_type.value
            if hasattr(service.service_type, "value")
            else str(service.service_type)
        ),

        "vendor": (
            vendor.business_name
            if vendor
            else ""
        ),

        "city": (
            version.city
            if version
            else None
        ),

        "price": (
            getattr(version, "starting_price", None)
            if version
            else None
        ),

        # CHANGED HERE
        "status": (
            version.status.value
            if version and hasattr(version.status, "value")
            else str(version.status)
            if version and version.status is not None
            else None
        ),

        "createdAt": service.created_at,

        "images": (
            [cover_image]
            if cover_image
            else []
        ),
    }
    

def build_full_service_response(service: Service):
    version = (
        service.current_draft_version
        or service.current_live_version
    )

    return {
        "service": {
            "id": service.id,
            "status": service.status,
            "service_type": service.service_type,
            "created_at": service.created_at,
        },

        "vendor": {
            "id": service.vendor.id,
            "name": service.vendor.business_name,
            "email": service.vendor.email,
            "phone": service.vendor.phone,
        },

        "version": {
            "id": version.id,
            "version_number": version.version_number,
            "service_name": version.service_name,
            "description": version.description,
            "city": version.city,
            "state": version.state,
            "metadata": version.metadata_,
        },

        "media": [
            {
                "id": m.id,
                "url": m.media_url,
                "type": m.media_type,
                "is_cover": m.is_cover,
            }
            for m in version.media
        ],

        "variants": [
            {
                "id": v.id,
                "name": v.variant_name,
                "pricing": v.pricing,
                "inclusions": v.inclusions,
            }
            for v in version.variants
        ],

        "service_details": (
            version.venue_detail
            or version.catering_detail
            or version.dj_detail
            or version.photography_detail
            or version.event_management_detail
            or version.makeup_artist_detail
        ),
    }


def build_review_detail(service: Service) -> dict:
    """Full service detail dict for the admin review page."""
    ver    = _review_version(service)
    vendor = service.vendor
    sid    = service.id

    return {
        # Service
        "service_id":     sid,
        "vendor_id":      service.vendor_id,
        "service_type":   service.service_type,
        "service_status": service.status,
        "is_active":      service.is_active,
        "created_at":     service.created_at,

        # Vendor snapshot
        "vendor_name":    vendor.business_name if vendor else "",
        "vendor_email":   vendor.email         if vendor else "",
        "vendor_phone":   vendor.phone         if vendor else None,

        # Version fields (flattened)
        "version_id":      ver.id              if ver else None,
        "version_number":  ver.version_number  if ver else None,
        "version_status":  ver.status          if ver else None,
        "service_name":    ver.service_name    if ver else None,
        "description":     ver.description     if ver else None,
        "add_line1":       ver.add_line1       if ver else None,
        "add_line2":       ver.add_line2       if ver else None,
        "area":            ver.area            if ver else None,
        "city":            ver.city            if ver else None,
        "state":           ver.state           if ver else None,
        "country":         ver.country         if ver else "India",
        "pincode":         ver.pincode         if ver else None,
        "latitude":        float(ver.latitude)  if (ver and ver.latitude)  else None,
        "longitude":       float(ver.longitude) if (ver and ver.longitude) else None,
        # NOTE: DB column is 'metadata' (no underscore); model exposes it as metadata_
        "metadata":        ver.metadata_        if (ver and ver.metadata_) else {},

        "submitted_at":   ver.submitted_at    if ver else None,
        "reviewed_at":    ver.reviewed_at     if ver else None,
        "reviewed_by":    ver.reviewed_by     if ver else None,
        "approved_at":    ver.approved_at     if ver else None,
        "approved_by":    ver.approved_by     if ver else None,
        "rejected_at":    ver.rejected_at     if ver else None,
        "rejected_by":    ver.rejected_by     if ver else None,
        "rejection_reason": ver.rejection_reason if ver else None,

        # Type-specific
        "venue":            _project_venue(ver, sid),
        "catering":         _project_catering(ver, sid),
        "dj":               _project_dj(ver, sid),
        "photography":      _project_photography(ver, sid),
        "event_management": _project_event_management(ver, sid),
        "makeup_artist":    _project_makeup(ver, sid),

        # Collections
        "variants":         _project_variants(ver, sid),
        "media":            _project_media(ver, sid),

        # History
        "version_history":  _project_version_history(service),
    }