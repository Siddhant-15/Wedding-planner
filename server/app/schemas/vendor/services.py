from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Variant ────────────────────────────────────────────────────────────────

class ServiceVariantCreate(BaseModel):
    variant_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    min_quantity: Optional[int] = None
    max_quantity: Optional[int] = None
    pricing_type: str = Field(..., description="BASE_PRICE | PER_PLATE | PER_HOUR | PER_DAY | PER_EVENT | PACKAGE | CUSTOM | HYBRID")
    currency: str = "INR"
    pricing: Dict[str, Any] = Field(default_factory=dict)
    menu: Optional[List[Any]] = None
    deliverables: Optional[List[Any]] = None
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    policies: Optional[Dict[str, Any]] = None
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    is_default: bool = False

    class Config:
        populate_by_name = True


# ─── Venue ──────────────────────────────────────────────────────────────────

class VenueCreate(BaseModel):
    venue_type: str = "banquet"
    venue_nature: str = "indoor"
    min_capacity: int = 10
    max_capacity: int = 1000
    square_feet: float = 1000.0
    parking_capacity: int = 0
    venue_policies: Dict[str, Any] = Field(default_factory=dict)


# ─── Catering ───────────────────────────────────────────────────────────────

class CateringCreate(BaseModel):
    cuisine_types: List[str] = Field(default_factory=list)
    meal_types: List[str] = Field(default_factory=list)
    veg_price_per_head: Optional[float] = None
    non_veg_price_per_head: Optional[float] = None
    min_order: int = 1
    max_order: Optional[int] = None
    service_styles: List[str] = Field(default_factory=list)
    staff_included: bool = True
    crockery_cutlery_included: bool = True
    tasting_available: bool = False
    setup_time_minutes: Optional[int] = None
    service_duration_minutes: Optional[int] = None
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    gst_percentage: float = 5.0
    price_includes_tax: bool = False
    special_diets_supported: List[str] = Field(default_factory=list)
    customizable_menu: bool = True


# ─── DJ ─────────────────────────────────────────────────────────────────────

class DjCreate(BaseModel):
    genres_supported: List[str] = Field(default_factory=list)
    languages_supported: List[str] = Field(default_factory=list)
    event_types_supported: List[str] = Field(default_factory=list)
    performance_duration_hours: float = 4.0
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
    experience_years: int = 0
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None


# ─── Photography ────────────────────────────────────────────────────────────

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
    team_size: int = 1
    second_shooter_included: bool = False
    editing_styles: List[str] = Field(default_factory=list)
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    experience_years: int = 0
    delivery_time_days: Optional[int] = None


# ─── Event Management ───────────────────────────────────────────────────────

class EventManagementCreate(BaseModel):
    event_types: List[str] = Field(default_factory=list)
    services_offered: List[str] = Field(default_factory=list)
    themes_supported: List[str] = Field(default_factory=list)
    team_size: Optional[int] = None
    on_site_managers: int = 1
    decoration_included: bool = False
    catering_management: bool = False
    entertainment_management: bool = False
    planning_duration_days: Optional[int] = None
    setup_time_hours: Optional[float] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    experience_years: int = 0
    vendor_network_size: Optional[int] = None
    package_modal: Optional[str] = None


# ─── Makeup Artist ──────────────────────────────────────────────────────────

class MakeupArtistCreate(BaseModel):
    makeup_types: List[str] = Field(default_factory=list)
    specialization: Optional[List[str]] = []
    brands_used: List[str] = Field(default_factory=list)
    premium_products_used: bool = True
    team_size: int = 1
    service_duration_minutes: Optional[int] = None
    travel_to_client: bool = True
    travel_cost_per_km: Optional[float] = None
    base_city: Optional[str] = None
    hairstyling_included: bool = True
    draping_included: bool = False
    trial_available: bool = False
    experience_years: int = 0


# ─── Metadata ───────────────────────────────────────────────────────────────

class ServiceMetadata(BaseModel):
    tags: List[str] = Field(default_factory=list)
    amenities: List[str] = Field(default_factory=list)

class MediaLink(BaseModel):
    id: Optional[int] = None

    # youtube | instagram | video | image | other
    type: str

    url: HttpUrl


# ─── Service Create (Main) ───────────────────────────────────────────────────

class ServiceCreate(BaseModel):
    service_name: str = Field(..., min_length=3, max_length=150)
    service_type: str = Field(..., description="venue | catering | dj | photography | makeup | event_management")
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
    media_links: List[MediaLink] = Field(
        default_factory=list
    )

    class Config:
        populate_by_name = True



class ServiceMediaResponse(BaseModel):
    media_url: str
    media_type: str
    source_type: str
    is_cover: bool = False

    class Config:
        from_attributes = True
# ─── Response Models ─────────────────────────────────────────────────────────

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

    class Config:
        from_attributes = True


class VariantResponse(BaseModel):
    id: int
    service_id: int
    variant_name: str
    description: Optional[str]
    pricing_type: str
    currency: str
    pricing: Dict[str, Any]
    inclusions: Optional[List[str]]
    exclusions: Optional[List[str]]
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        from_attributes = True


class UnavailableDateResponse(BaseModel):
    id: int
    service_id: int
    start_date: datetime
    end_date: datetime
    reason: Optional[str]

    class Config:
        from_attributes = True


class ServiceResponse(BaseModel):
    id: int
    vendor_id: int
    service_type: str
    service_name: str
    description: Optional[str]
    add_line1: Optional[str]
    add_line2: Optional[str]
    area: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: str
    pincode: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    is_active: bool
    is_verified: bool
    metadata: Dict[str, Any] = Field(default_factory=dict)
    media: List[ServiceMediaResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    venue: Optional[Dict[str, Any]] = None
    catering: Optional[Dict[str, Any]] = None
    dj: Optional[Dict[str, Any]] = None
    photography: Optional[Dict[str, Any]] = None
    event_management: Optional[Dict[str, Any]] = None
    makeup_artist: Optional[Dict[str, Any]] = None

    variants: List[Dict[str, Any]] = Field(default_factory=list)
    unavailable_dates: List[Any] = Field(default_factory=list)

    class Config:
        from_attributes = True