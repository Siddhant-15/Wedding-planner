"""
app/schemas/services.py
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# =============================================================================
# ENUMS
# =============================================================================

class ServiceStatusEnum(str, enum.Enum):
    draft = "draft"
    under_review = "under_review"
    live = "live"
    inactive = "inactive"
    suspended = "suspended"
    needs_revision = "needs_revision"
    rejected = "rejected"


ServiceStatus = ServiceStatusEnum


class ServiceVersionStatus(str, enum.Enum):
    draft = "draft"
    under_review = "under_review"
    approved = "approved"
    published = "published"
    rejected = "rejected"
    archived = "archived"


# =============================================================================
# VARIANT
# =============================================================================

class ServiceVariantCreate(BaseModel):
    variant_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    min_quantity: Optional[int] = None
    max_quantity: Optional[int] = None
    pricing_type: str = Field(
        ...,
        description="BASE_PRICE | PER_PLATE | PER_HOUR | PER_DAY | PER_EVENT | PACKAGE | CUSTOM | HYBRID",
    )
    currency: str = "INR"
    pricing: Dict[str, Any] = Field(default_factory=dict)
    menu: Optional[List[Any]] = None
    deliverables: Optional[List[Any]] = None
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    policies: Optional[Dict[str, Any]] = None
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    is_default: bool = False

    model_config = {"populate_by_name": True}


# =============================================================================
# TYPE-SPECIFIC CREATE SCHEMAS
# Explicit null from frontend → fall back to defaults (draft-friendly)
# =============================================================================

class VenueCreate(BaseModel):
    venue_type: Optional[str] = "banquet"
    venue_nature: Optional[str] = "indoor"
    min_capacity: Optional[int] = 10
    max_capacity: Optional[int] = 1000
    square_feet: Optional[float] = 1000.0
    parking_capacity: Optional[int] = 0
    venue_policies: Dict[str, Any] = Field(default_factory=dict)

    @field_validator(
        "venue_type",
        "venue_nature",
        "min_capacity",
        "max_capacity",
        "square_feet",
        "parking_capacity",
        mode="before",
    )
    @classmethod
    def none_to_default(cls, v, info):
        if v is not None:
            return v
        defaults = {
            "venue_type": "banquet",
            "venue_nature": "indoor",
            "min_capacity": 10,
            "max_capacity": 1000,
            "square_feet": 1000.0,
            "parking_capacity": 0,
        }
        return defaults.get(info.field_name)


class CateringCreate(BaseModel):
    cuisine_types: List[str] = Field(default_factory=list)
    meal_types: List[str] = Field(default_factory=list)
    veg_price_per_head: Optional[float] = None
    non_veg_price_per_head: Optional[float] = None
    min_order: Optional[int] = 1
    max_order: Optional[int] = None
    service_styles: List[str] = Field(default_factory=list)
    staff_included: bool = True
    crockery_cutlery_included: bool = True
    tasting_available: bool = False
    setup_time_minutes: Optional[int] = None
    service_duration_minutes: Optional[int] = None
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    gst_percentage: Optional[float] = 5.0
    price_includes_tax: bool = False
    special_diets_supported: List[str] = Field(default_factory=list)
    customizable_menu: bool = True

    @field_validator("min_order", "gst_percentage", mode="before")
    @classmethod
    def none_to_default(cls, v, info):
        if v is not None:
            return v
        return {"min_order": 1, "gst_percentage": 5.0}.get(info.field_name)


class DjCreate(BaseModel):
    genres_supported: List[str] = Field(default_factory=list)
    languages_supported: List[str] = Field(default_factory=list)
    event_types_supported: List[str] = Field(default_factory=list)
    performance_duration_hours: Optional[float] = 4.0
    overtime_rate_per_hour: Optional[float] = None
    equipments_provided: List[str] = Field(default_factory=list)
    sound_system_included: bool = True
    lighting_included: bool = False
    smoke_machine_included: bool = False
    led_wall_included: bool = False
    mc_host_available: bool = False
    crowd_interaction_level: Optional[str] = None
    setup_time_minutes: Optional[int] = None
    teardown_time_minutes: Optional[int] = None
    power_requirement_kw: Optional[float] = None
    backup_power_required: bool = False
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    outdoor_supported: bool = True
    late_night_allowed: bool = True
    sound_license_required: bool = True
    custom_playlist_allowed: bool = True
    playlist_link_supported: bool = True
    experience_years: Optional[int] = 0

    @field_validator("performance_duration_hours", "experience_years", mode="before")
    @classmethod
    def none_to_default(cls, v, info):
        if v is not None:
            return v
        return {"performance_duration_hours": 4.0, "experience_years": 0}.get(info.field_name)


class PhotographyCreate(BaseModel):
    photography_types: List[str] = Field(default_factory=list)
    videography_included: bool = False
    drone_available: bool = False
    photo_delivery_count: Optional[int] = None
    video_delivery_duration_minutes: Optional[int] = None
    edited_photos_included: bool = True
    raw_photos_provided: bool = False
    album_included: bool = False
    album_pages: Optional[int] = None
    coverage_hours: Optional[float] = None
    overtime_rate_per_hour: Optional[float] = None
    team_size: Optional[int] = 1
    second_shooter_included: bool = False
    editing_styles: List[str] = Field(default_factory=list)
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    experience_years: Optional[int] = 0
    delivery_time_days: Optional[int] = None

    @field_validator("team_size", "experience_years", mode="before")
    @classmethod
    def none_to_default(cls, v, info):
        if v is not None:
            return v
        return {"team_size": 1, "experience_years": 0}.get(info.field_name)


class EventManagementCreate(BaseModel):
    event_types: List[str] = Field(default_factory=list)
    services_offered: List[str] = Field(default_factory=list)
    themes_supported: List[str] = Field(default_factory=list)
    team_size: Optional[int] = None
    on_site_managers: Optional[int] = 1
    decoration_included: bool = False
    catering_management: bool = False
    entertainment_management: bool = False
    planning_duration_days: Optional[int] = None
    setup_time_hours: Optional[float] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    experience_years: Optional[int] = 0
    vendor_network_size: Optional[int] = None
    package_modal: Optional[str] = None

    @field_validator("on_site_managers", "experience_years", mode="before")
    @classmethod
    def none_to_default(cls, v, info):
        if v is not None:
            return v
        return {"on_site_managers": 1, "experience_years": 0}.get(info.field_name)


class MakeupArtistCreate(BaseModel):
    makeup_types: List[str] = Field(default_factory=list)
    specialization: List[str] = Field(default_factory=list)
    brands_used: List[str] = Field(default_factory=list)
    premium_products_used: bool = True
    team_size: Optional[int] = 1
    service_duration_minutes: Optional[int] = None
    travel_to_client: bool = True
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    hairstyling_included: bool = True
    draping_included: bool = False
    trial_available: bool = False
    experience_years: Optional[int] = 0

    @field_validator("team_size", "experience_years", mode="before")
    @classmethod
    def none_to_default(cls, v, info):
        if v is not None:
            return v
        return {"team_size": 1, "experience_years": 0}.get(info.field_name)


# =============================================================================
# SERVICE METADATA
# =============================================================================

class ServiceMetadata(BaseModel):
    tags: List[str] = Field(default_factory=list)
    amenities: List[str] = Field(default_factory=list)


# =============================================================================
# SERVICE CREATE
# =============================================================================

class ServiceCreate(BaseModel):
    service_name: str = Field(..., min_length=3, max_length=150)
    service_type: str = Field(
        ...,
        description="venue | catering | dj | photography | makeup_artist | event_management",
    )
    description: Optional[str] = None

    add_line1: Optional[str] = None
    add_line2: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None

    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

    metadata_: Optional[ServiceMetadata] = Field(None, alias="metadata")

    venue: Optional[VenueCreate] = None
    catering: Optional[CateringCreate] = None
    dj: Optional[DjCreate] = None
    photography: Optional[PhotographyCreate] = None
    event_management: Optional[EventManagementCreate] = None
    makeup_artist: Optional[MakeupArtistCreate] = None

    variants: List[ServiceVariantCreate] = Field(default_factory=list)

    model_config = {"populate_by_name": True}

    @field_validator("city", "state", "pincode", "area", "add_line1", "add_line2", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        """Frontend often sends "" for empty location fields."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class ServiceCreateResponse(BaseModel):
    message: str
    service_id: int


class MediaResponse(BaseModel):
    id: int
    service_id: int
    media_url: str
    media_type: str
    is_cover: bool
    display_order: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = {"from_attributes": True}


class VariantResponse(BaseModel):
    id: int
    service_id: int
    variant_name: str
    description: Optional[str] = None
    pricing_type: str
    currency: str
    pricing: Dict[str, Any]
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

    model_config = {"from_attributes": True}


class UnavailableDateResponse(BaseModel):
    id: int
    service_id: int
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None

    model_config = {"from_attributes": True}


class RevisionFeedbackItem(BaseModel):
    section: str
    comment: Optional[str] = None

    model_config = {"from_attributes": True}


class ServiceResponse(BaseModel):
    id: int
    vendor_id: int
    service_type: str
    service_name: str
    description: Optional[str] = None

    add_line1: Optional[str] = None
    add_line2: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    status: str
    is_active: bool
    is_verified: bool

    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    version_id: Optional[int] = None
    version_number: Optional[int] = None
    version_status: Optional[str] = None

    venue: Optional[Dict[str, Any]] = None
    catering: Optional[Dict[str, Any]] = None
    dj: Optional[Dict[str, Any]] = None
    photography: Optional[Dict[str, Any]] = None
    event_management: Optional[Dict[str, Any]] = None
    makeup_artist: Optional[Dict[str, Any]] = None

    variants: List[Dict[str, Any]] = Field(default_factory=list)
    media: List[Dict[str, Any]] = Field(default_factory=list)
    unavailable_dates: List[Any] = Field(default_factory=list)
    revision_feedback: Optional[List[RevisionFeedbackItem]] = None

    model_config = {"from_attributes": True}