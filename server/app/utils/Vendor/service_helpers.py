"""
app/utils/Vendor/service_helpers.py

Pure stateless helpers used by the service controller.

Public API:
  _enforce_variants      – guarantees exactly one default variant
  _add_type_specific     – inserts type-detail row for a new ServiceVersion
  _update_type_specific  – upserts type-detail row on an existing ServiceVersion
  _active_version        – returns draft (preferred) or live ServiceVersion
  _build_service_response – flattens Service + ServiceVersion into the flat
                            ServiceResponse shape the frontend already expects
"""

from __future__ import annotations

import logging
from typing import List, Optional

from app.models.models import (
    CateringDetail,
    DjDetail,
    EventManagementDetail,
    MakeupArtistDetail,
    PhotographyDetail,
    Service,
    ServiceVariant,
    ServiceVersion,
    Venue,
)
from app.schemas.services import (
    ServiceCreate,
    ServiceResponse,
    ServiceVariantCreate,
)

logger = logging.getLogger(__name__)


# =============================================================================
# VARIANT ENFORCEMENT
# =============================================================================

def _enforce_variants(
    variants: List[ServiceVariantCreate],
) -> List[ServiceVariantCreate]:
    """
    Guarantee exactly one variant is marked is_default.

    Rules:
      - Empty list  → inject a minimal 'Basic Package' variant.
      - No default  → promote variants[0].
      - >1 defaults → keep only the first one found, clear the rest.
    """
    if not variants:
        return [
            ServiceVariantCreate(
                variant_name="Basic Package",
                pricing_type="BASE_PRICE",
                pricing={"base_price": 0},
                is_default=True,
            )
        ]

    default_count = sum(1 for v in variants if v.is_default)

    if default_count == 0:
        variants[0].is_default = True
    elif default_count > 1:
        found = False
        for v in variants:
            if v.is_default:
                if found:
                    v.is_default = False
                else:
                    found = True

    return variants


# =============================================================================
# ACTIVE VERSION SELECTOR
# =============================================================================

def _active_version(service: Service) -> Optional[ServiceVersion]:
    """
    Return the version to read/edit:
      - draft   → in-progress edits, preferred for vendor-facing views
      - live    → fallback when no draft exists
    """
    return service.current_draft_version or service.current_live_version


# =============================================================================
# TYPE-SPECIFIC DETAIL  — INSERT
# =============================================================================

def _add_type_specific(
    db,
    version_id: int,
    parsed: ServiceCreate,
) -> None:
    """
    Insert the detail row (Venue / CateringDetail / DjDetail / …)
    for a brand-new ServiceVersion.

    All detail rows reference service_version_id, NOT service_id.
    """
    stype = parsed.service_type

    if stype == "venue" and parsed.venue:
        vp = parsed.venue.venue_policies or {}
        db.add(Venue(
            service_version_id=version_id,
            venue_type=parsed.venue.venue_type,
            venue_nature=parsed.venue.venue_nature,
            max_capacity=parsed.venue.max_capacity,
            parking_capacity=parsed.venue.parking_capacity,
            venue_policies={
                "decoration_policy": vp.get("decoration_policy", ""),
                "catering_policy":   vp.get("catering_policy", ""),
                "alcohol_policy":    vp.get("alcohol_policy", ""),
                "other_policies":    vp.get("other_policies", []),
            },
        ))

    elif stype == "catering" and parsed.catering:
        c = parsed.catering
        db.add(CateringDetail(
            service_version_id=version_id,
            cuisine_types=c.cuisine_types or [],
            meal_types=c.meal_types or [],
            veg_price_per_head=c.veg_price_per_head,
            non_veg_price_per_head=c.non_veg_price_per_head,
            min_order=c.min_order,
            max_order=c.max_order,
            service_styles=c.service_styles or [],
            staff_included=c.staff_included,
            crockery_cutlery_included=c.crockery_cutlery_included,
            tasting_available=c.tasting_available,
            setup_time_minutes=c.setup_time_minutes,
            service_duration_minutes=c.service_duration_minutes,
            travel_cost_per_km=c.travel_cost_per_km,
            base_city=c.base_city,
            gst_percentage=c.gst_percentage,
            price_includes_tax=c.price_includes_tax,
            special_diets_supported=c.special_diets_supported or [],
            customizable_menu=c.customizable_menu,
        ))

    elif stype == "dj" and parsed.dj:
        d = parsed.dj
        db.add(DjDetail(
            service_version_id=version_id,
            genres_supported=d.genres_supported or [],
            languages_supported=d.languages_supported or [],
            event_types_supported=d.event_types_supported or ["wedding"],
            performance_duration_hours=d.performance_duration_hours,
            overtime_rate_per_hour=d.overtime_rate_per_hour,
            equipments_provided=d.equipments_provided or [],
            sound_system_included=d.sound_system_included,
            lighting_included=d.lighting_included,
            smoke_machine_included=d.smoke_machine_included,
            led_wall_included=d.led_wall_included,
            mc_host_available=d.mc_host_available,
            crowd_interaction_level=d.crowd_interaction_level,
            setup_time_minutes=d.setup_time_minutes,
            teardown_time_minutes=d.teardown_time_minutes,
            power_requirement_kw=d.power_requirement_kw,
            backup_power_required=d.backup_power_required,
            travel_cost_per_km=d.travel_cost_per_km,
            base_city=d.base_city,
            outdoor_supported=d.outdoor_supported,
            late_night_allowed=d.late_night_allowed,
            sound_license_required=d.sound_license_required,
            custom_playlist_allowed=d.custom_playlist_allowed,
            playlist_link_supported=d.playlist_link_supported,
            experience_years=d.experience_years,
        ))

    elif stype == "photography" and parsed.photography:
        p = parsed.photography
        db.add(PhotographyDetail(
            service_version_id=version_id,
            photography_types=p.photography_types or [],
            videography_available=p.videography_included,
            drone_shoot_available=p.drone_available,
            photo_delivery_count=p.photo_delivery_count,
            video_delivery_duration_minutes=p.video_delivery_duration_minutes,
            edited_photos_included=p.edited_photos_included,
            raw_photos_provided=p.raw_photos_provided,
            album_included=p.album_included,
            album_pages=p.album_pages,
            coverage_hours=p.coverage_hours,
            overtime_rate_per_hour=p.overtime_rate_per_hour,
            team_size=p.team_size,
            second_shooter_included=p.second_shooter_included,
            editing_styles=p.editing_styles or [],
            travel_cost_per_km=p.travel_cost_per_km,
            base_city=p.base_city,
            experience_years=p.experience_years,
        ))

    elif stype == "event_management" and parsed.event_management:
        em = parsed.event_management
        db.add(EventManagementDetail(
            service_version_id=version_id,
            event_types_supported=em.event_types or [],
            services_offered=em.services_offered or [],
            themes_supported=em.themes_supported or [],
            team_size=em.team_size,
            on_site_managers=em.on_site_managers,
            decoration_included=em.decoration_included,
            catering_management=em.catering_management,
            entertainment_management=em.entertainment_management,
            planning_duration_days=em.planning_duration_days,
            setup_time_hours=em.setup_time_hours,
            min_budget=em.min_budget,
            max_budget=em.max_budget,
            travel_cost_per_km=em.travel_cost_per_km,
            base_city=em.base_city,
            experience_years=em.experience_years,
        ))

    elif stype == "makeup_artist" and parsed.makeup_artist:
        ma = parsed.makeup_artist
        db.add(MakeupArtistDetail(
            service_version_id=version_id,
            makeup_types=ma.makeup_types or [],
            specialization=ma.specialization or [],
            brands_used=ma.brands_used or [],
            premium_products_used=ma.premium_products_used,
            team_size=ma.team_size,
            service_duration_minutes=ma.service_duration_minutes,
            travel_to_client=ma.travel_to_client,
            travel_cost_per_km=ma.travel_cost_per_km,
            base_city=ma.base_city,
            hairstyling_included=ma.hairstyling_included,
            draping_included=ma.draping_included,
            trial_available=ma.trial_available,
            experience_years=ma.experience_years,
        ))


# =============================================================================
# TYPE-SPECIFIC DETAIL  — UPSERT
# =============================================================================

def _update_type_specific(
    db,
    version: ServiceVersion,
    parsed: ServiceCreate,
) -> None:
    """
    Upsert the detail row on an existing ServiceVersion.

    If the row already exists → patch each field.
    If it doesn't             → delegate to _add_type_specific.
    """
    stype = parsed.service_type

    if stype == "venue" and parsed.venue:
        if version.venue_detail:
            row = version.venue_detail
            v   = parsed.venue
            vp  = v.venue_policies or {}
            row.venue_type       = v.venue_type
            row.venue_nature     = v.venue_nature
            row.max_capacity     = v.max_capacity
            row.parking_capacity = v.parking_capacity
            row.venue_policies   = {
                "decoration_policy": vp.get("decoration_policy", ""),
                "catering_policy":   vp.get("catering_policy", ""),
                "alcohol_policy":    vp.get("alcohol_policy", ""),
                "other_policies":    vp.get("other_policies", []),
            }
        else:
            _add_type_specific(db, version.id, parsed)

    elif stype == "catering" and parsed.catering:
        if version.catering_detail:
            row = version.catering_detail
            c   = parsed.catering
            row.cuisine_types              = c.cuisine_types or []
            row.meal_types                 = c.meal_types or []
            row.veg_price_per_head         = c.veg_price_per_head
            row.non_veg_price_per_head     = c.non_veg_price_per_head
            row.min_order                  = c.min_order
            row.max_order                  = c.max_order
            row.service_styles             = c.service_styles or []
            row.staff_included             = c.staff_included
            row.crockery_cutlery_included  = c.crockery_cutlery_included
            row.tasting_available          = c.tasting_available
            row.setup_time_minutes         = c.setup_time_minutes
            row.service_duration_minutes   = c.service_duration_minutes
            row.travel_cost_per_km         = c.travel_cost_per_km
            row.base_city                  = c.base_city
            row.gst_percentage             = c.gst_percentage
            row.price_includes_tax         = c.price_includes_tax
            row.special_diets_supported    = c.special_diets_supported or []
            row.customizable_menu          = c.customizable_menu
        else:
            _add_type_specific(db, version.id, parsed)

    elif stype == "dj" and parsed.dj:
        if version.dj_detail:
            row = version.dj_detail
            d   = parsed.dj
            row.genres_supported           = d.genres_supported or []
            row.languages_supported        = d.languages_supported or []
            row.event_types_supported      = d.event_types_supported or ["wedding"]
            row.performance_duration_hours = d.performance_duration_hours
            row.overtime_rate_per_hour     = d.overtime_rate_per_hour
            row.equipments_provided        = d.equipments_provided or []
            row.sound_system_included      = d.sound_system_included
            row.lighting_included          = d.lighting_included
            row.smoke_machine_included     = d.smoke_machine_included
            row.led_wall_included          = d.led_wall_included
            row.mc_host_available          = d.mc_host_available
            row.crowd_interaction_level    = d.crowd_interaction_level
            row.setup_time_minutes         = d.setup_time_minutes
            row.teardown_time_minutes      = d.teardown_time_minutes
            row.power_requirement_kw       = d.power_requirement_kw
            row.backup_power_required      = d.backup_power_required
            row.travel_cost_per_km         = d.travel_cost_per_km
            row.base_city                  = d.base_city
            row.outdoor_supported          = d.outdoor_supported
            row.late_night_allowed         = d.late_night_allowed
            row.sound_license_required     = d.sound_license_required
            row.custom_playlist_allowed    = d.custom_playlist_allowed
            row.playlist_link_supported    = d.playlist_link_supported
            row.experience_years           = d.experience_years
        else:
            _add_type_specific(db, version.id, parsed)

    elif stype == "photography" and parsed.photography:
        if version.photography_detail:
            row = version.photography_detail
            p   = parsed.photography
            row.photography_types               = p.photography_types or []
            row.videography_available           = p.videography_included
            row.drone_shoot_available           = p.drone_available
            row.photo_delivery_count            = p.photo_delivery_count
            row.video_delivery_duration_minutes = p.video_delivery_duration_minutes
            row.edited_photos_included          = p.edited_photos_included
            row.raw_photos_provided             = p.raw_photos_provided
            row.album_included                  = p.album_included
            row.album_pages                     = p.album_pages
            row.coverage_hours                  = p.coverage_hours
            row.overtime_rate_per_hour          = p.overtime_rate_per_hour
            row.team_size                       = p.team_size
            row.second_shooter_included         = p.second_shooter_included
            row.editing_styles                  = p.editing_styles or []
            row.travel_cost_per_km              = p.travel_cost_per_km
            row.base_city                       = p.base_city
            row.experience_years                = p.experience_years
        else:
            _add_type_specific(db, version.id, parsed)

    elif stype == "event_management" and parsed.event_management:
        if version.event_management_detail:
            row = version.event_management_detail
            em  = parsed.event_management
            row.event_types_supported    = em.event_types or []
            row.services_offered         = em.services_offered or []
            row.themes_supported         = em.themes_supported or []
            row.team_size                = em.team_size
            row.on_site_managers         = em.on_site_managers
            row.decoration_included      = em.decoration_included
            row.catering_management      = em.catering_management
            row.entertainment_management = em.entertainment_management
            row.planning_duration_days   = em.planning_duration_days
            row.setup_time_hours         = em.setup_time_hours
            row.min_budget               = em.min_budget
            row.max_budget               = em.max_budget
            row.travel_cost_per_km       = em.travel_cost_per_km
            row.base_city                = em.base_city
            row.experience_years         = em.experience_years
        else:
            _add_type_specific(db, version.id, parsed)

    elif stype == "makeup_artist" and parsed.makeup_artist:
        if version.makeup_artist_detail:
            row = version.makeup_artist_detail
            ma  = parsed.makeup_artist
            row.makeup_types             = ma.makeup_types or []
            row.specialization           = ma.specialization or []
            row.brands_used              = ma.brands_used or []
            row.premium_products_used    = ma.premium_products_used
            row.team_size                = ma.team_size
            row.service_duration_minutes = ma.service_duration_minutes
            row.travel_to_client         = ma.travel_to_client
            row.travel_cost_per_km       = ma.travel_cost_per_km
            row.base_city                = ma.base_city
            row.hairstyling_included     = ma.hairstyling_included
            row.draping_included         = ma.draping_included
            row.trial_available          = ma.trial_available
            row.experience_years         = ma.experience_years
        else:
            _add_type_specific(db, version.id, parsed)


# =============================================================================
# RESPONSE BUILDER
# =============================================================================

def _jsonb_list(val) -> list:
    """Normalise a JSONB column: dict → list of values, list → as-is, None → []."""
    if isinstance(val, dict):
        return list(val.values())
    return val or []


def _col_dict(row, exclude: set[str] | None = None) -> dict:
    """Dump all SQLAlchemy column values from a model row into a plain dict."""
    exclude = exclude or set()
    return {
        col.name: getattr(row, col.name)
        for col in row.__table__.columns
        if col.name not in exclude
    }


def _build_service_response(service: Service) -> ServiceResponse:
    """
    Flatten Service + ServiceVersion into the identical flat shape
    the frontend has always received.

    Column mapping (old location → new location):
      service_name, description, location fields  → ServiceVersion
      metadata_                                   → ServiceVersion.metadata_
      variants[].service_id                       → alias of service_version_id
      media[].service_id                          → alias of service_version_id
      <type>detail.service_id                     → alias of service_version_id
    """
    ver = _active_version(service)

    # ── Scalars from the active version ──────────────────────────────────────
    service_name = ver.service_name if ver else ""
    description  = ver.description  if ver else None
    add_line1    = ver.add_line1    if ver else None
    add_line2    = ver.add_line2    if ver else None
    area         = ver.area         if ver else None
    city         = ver.city         if ver else None
    state        = ver.state        if ver else None
    country      = ver.country      if ver else "India"
    pincode      = ver.pincode      if ver else None
    latitude     = float(ver.latitude)  if (ver and ver.latitude  is not None) else None
    longitude    = float(ver.longitude) if (ver and ver.longitude is not None) else None
    # metadata_ on ServiceVersion (underscore avoids collision with Pydantic's .metadata)
    metadata     = ver.metadata_    if (ver and ver.metadata_ is not None) else {}
    updated_at   = ver.updated_at   if ver else service.updated_at

    # is_verified = True once a published live version exists
    is_verified = bool(
        service.current_live_version
        and service.current_live_version.status == "published"
    )

    # ── Type-specific detail ──────────────────────────────────────────────────
    SKIP = {"service_version_id"}            # replaced with aliased service_id

    venue_data            = None
    catering_data         = None
    dj_data               = None
    photography_data      = None
    event_management_data = None
    makeup_data           = None

    if ver:
        if ver.venue_detail:
            row = ver.venue_detail
            venue_data = _col_dict(row, SKIP)
            venue_data["service_id"]    = service.id
            venue_data["venue_policies"] = row.venue_policies or {
                "decoration_policy": "",
                "catering_policy":   "",
                "alcohol_policy":    "",
                "other_policies":    [],
            }

        if ver.catering_detail:
            row = ver.catering_detail
            catering_data = _col_dict(row, SKIP)
            catering_data["service_id"]              = service.id
            catering_data["cuisine_types"]           = _jsonb_list(row.cuisine_types)
            catering_data["meal_types"]              = _jsonb_list(row.meal_types)
            catering_data["service_styles"]          = _jsonb_list(row.service_styles)
            catering_data["special_diets_supported"] = _jsonb_list(row.special_diets_supported)

        if ver.dj_detail:
            row = ver.dj_detail
            dj_data = _col_dict(row, SKIP)
            dj_data["service_id"]            = service.id
            dj_data["genres_supported"]      = _jsonb_list(row.genres_supported)
            dj_data["languages_supported"]   = _jsonb_list(row.languages_supported)
            dj_data["event_types_supported"] = row.event_types_supported or []
            dj_data["equipments_provided"]   = _jsonb_list(row.equipments_provided)

        if ver.photography_detail:
            row = ver.photography_detail
            photography_data = _col_dict(row, SKIP)
            photography_data["service_id"]        = service.id
            photography_data["photography_types"] = _jsonb_list(row.photography_types)
            photography_data["editing_styles"]    = _jsonb_list(row.editing_styles)

        if ver.event_management_detail:
            row = ver.event_management_detail
            event_management_data = _col_dict(row, SKIP)
            event_management_data["service_id"]            = service.id
            event_management_data["event_types_supported"] = _jsonb_list(row.event_types_supported)
            event_management_data["services_offered"]      = _jsonb_list(row.services_offered)
            event_management_data["themes_supported"]      = _jsonb_list(row.themes_supported)

        if ver.makeup_artist_detail:
            row = ver.makeup_artist_detail
            makeup_data = _col_dict(row, SKIP)
            makeup_data["service_id"]   = service.id
            makeup_data["makeup_types"] = _jsonb_list(row.makeup_types)
            makeup_data["brands_used"]  = _jsonb_list(row.brands_used)

    # ── Variants ──────────────────────────────────────────────────────────────
    variants_out: list[dict] = []
    if ver:
        for v in ver.variants:
            row = _col_dict(v, SKIP)
            row["service_id"]   = service.id
            row["inclusions"]   = v.inclusions or []
            row["exclusions"]   = v.exclusions or []
            row["menu"]         = _jsonb_list(v.menu)
            row["deliverables"] = _jsonb_list(v.deliverables)
            row["metadata"]     = v.metadata_ or {}
            variants_out.append(row)

    # ── Media ─────────────────────────────────────────────────────────────────
    media_out: list[dict] = []
    if ver:
        for m in ver.media:
            row = _col_dict(m, SKIP)
            row["service_id"] = service.id
            row["metadata"]   = m.metadata_ or {}
            media_out.append(row)

    return ServiceResponse(
        id=service.id,
        vendor_id=service.vendor_id,
        service_type=service.service_type,
        service_name=service_name,
        description=description,
        add_line1=add_line1,
        add_line2=add_line2,
        area=area,
        city=city,
        state=state,
        country=country,
        pincode=pincode,
        latitude=latitude,
        longitude=longitude,
        status=service.status,
        is_active=service.is_active,
        is_verified=is_verified,
        metadata=metadata,
        created_at=service.created_at,
        updated_at=updated_at,
        # extra version context — old frontend clients safely ignore these
        version_id=ver.id             if ver else None,
        version_number=ver.version_number if ver else None,
        version_status=ver.status     if ver else None,
        # type-specific
        venue=venue_data,
        catering=catering_data,
        dj=dj_data,
        photography=photography_data,
        event_management=event_management_data,
        makeup_artist=makeup_data,
        # collections
        variants=variants_out,
        media=media_out,
        unavailable_dates=service.unavailable_dates or [],
    )