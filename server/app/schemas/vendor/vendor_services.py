from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import (
    BaseModel,
    Field,
    HttpUrl,
    field_validator,
)

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

VALID_SERVICE_TYPES = {
    "venue",
    "catering",
    "dj",
    "photography",
    "makeup_artist",
    "event_management",
}

VALID_MEDIA_TYPES = {
    "youtube",
    "instagram",
    "vimeo",
    "image",
    "video",
    "other",
}

# ─────────────────────────────────────────────────────────────────────────────
# COMMON
# ─────────────────────────────────────────────────────────────────────────────

class ServiceMetadata(BaseModel):
    tags: List[str] = Field(default_factory=list)

    amenities: List[str] = Field(default_factory=list)

    features: List[str] = Field(default_factory=list)

    languages_supported: List[str] = Field(
        default_factory=list
    )

    extra_info: Dict[str, Any] = Field(
        default_factory=dict
    )


# ─────────────────────────────────────────────────────────────────────────────
# MEDIA
# ─────────────────────────────────────────────────────────────────────────────

class MediaLink(BaseModel):
    id: Optional[int] = None

    type: str

    url: HttpUrl

    is_cover: bool = False

    display_order: int = 0

    metadata_: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
    )

    class Config:
        populate_by_name = True

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str):
        if value not in VALID_MEDIA_TYPES:
            raise ValueError("Invalid media type")
        return value


class ServiceMediaResponse(BaseModel):
    media_url: str

    media_type: str

    source_type: str

    is_cover: bool = False

    display_order: int = 0

    metadata_: Dict[str, Any] = Field(
        default_factory=dict,
    )

    class Config:
        from_attributes = True
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# VARIANTS
# ─────────────────────────────────────────────────────────────────────────────

class ServiceVariantCreate(BaseModel):
    variant_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    description: Optional[str] = None

    min_quantity: Optional[int] = Field(
        default=None,
        ge=1,
    )

    max_quantity: Optional[int] = Field(
        default=None,
        ge=1,
    )

    pricing_type: str

    currency: str = "INR"

    pricing: Dict[str, Any] = Field(
        default_factory=dict
    )

    menu: List[str] = Field(
        default_factory=list
    )

    deliverables: List[str] = Field(
        default_factory=list
    )

    inclusions: List[str] = Field(
        default_factory=list
    )

    exclusions: List[str] = Field(
        default_factory=list
    )

    policies: Dict[str, Any] = Field(
        default_factory=dict
    )

    is_default: bool = False

    metadata_: Dict[str, Any] = Field(
        default_factory=dict,
    )

    class Config:
        populate_by_name = True

    @field_validator("max_quantity")
    @classmethod
    def validate_quantity(
        cls,
        value,
        info,
    ):
        min_quantity = info.data.get(
            "min_quantity"
        )

        if (
            value is not None
            and min_quantity is not None
            and value < min_quantity
        ):
            raise ValueError(
                "max_quantity must be >= min_quantity"
            )

        return value


# ─────────────────────────────────────────────────────────────────────────────
# VENUE
# ─────────────────────────────────────────────────────────────────────────────

class VenuePoliciesSchema(BaseModel):
    decoration_policy: Optional[str] = ""

    catering_policy: Optional[str] = ""

    alcohol_policy: Optional[str] = ""

    other_policies: List[str] = Field(
        default_factory=list
    )


class VenueDetailsSchema(BaseModel):
    venue_type: str

    venue_nature: str

    max_capacity: int

    min_capacity: int

    square_feet: float

    parking_capacity: int = 0

    venue_policies: VenuePoliciesSchema = Field(
        default_factory=VenuePoliciesSchema
    )


# ─────────────────────────────────────────────────────────────────────────────
# CATERING
# ─────────────────────────────────────────────────────────────────────────────

class CateringDetailsSchema(BaseModel):
    cuisine_types: List[str] = Field(
        default_factory=list
    )

    meal_types: List[str] = Field(
        default_factory=list
    )

    veg_price_per_head: Optional[float] = None

    non_veg_price_per_head: Optional[float] = None

    min_order: int

    max_order: Optional[int] = None

    service_styles: List[str] = Field(
        default_factory=list
    )

    staff_included: bool = True

    crockery_cutlery_included: bool = True

    tasting_available: bool = False

    setup_time_minutes: Optional[int] = None

    service_duration_minutes: Optional[int] = None

    travel_cost_per_km: Optional[float] = None

    base_city: Optional[str] = None

    gst_percentage: float = 5.0

    price_includes_tax: bool = False

    special_diets_supported: List[str] = Field(
        default_factory=list
    )

    customizable_menu: bool = True


# ─────────────────────────────────────────────────────────────────────────────
# DJ
# ─────────────────────────────────────────────────────────────────────────────

class DjDetailsSchema(BaseModel):
    genres_supported: List[str] = Field(
        default_factory=list
    )

    languages_supported: List[str] = Field(
        default_factory=list
    )

    event_types_supported: List[str] = Field(
        default_factory=lambda: ["wedding"]
    )

    performance_duration_hours: float

    overtime_rate_per_hour: Optional[float] = None

    equipments_provided: List[str] = Field(
        default_factory=list
    )

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


# ─────────────────────────────────────────────────────────────────────────────
# PHOTOGRAPHY
# ─────────────────────────────────────────────────────────────────────────────

class PhotographyDetailsSchema(BaseModel):
    photography_types: List[str] = Field(
        default_factory=list
    )

    videography_available: bool = False

    drone_shoot_available: bool = False

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

    editing_styles: List[str] = Field(
        default_factory=list
    )

    travel_cost_per_km: Optional[float] = None

    base_city: Optional[str] = None

    experience_years: int = 0


# ─────────────────────────────────────────────────────────────────────────────
# EVENT MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

class EventManagementDetailsSchema(BaseModel):
    event_types_supported: List[str] = Field(
        default_factory=list
    )

    services_offered: List[str] = Field(
        default_factory=list
    )

    themes_supported: List[str] = Field(
        default_factory=list
    )

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


# ─────────────────────────────────────────────────────────────────────────────
# MAKEUP ARTIST
# ─────────────────────────────────────────────────────────────────────────────

class MakeupArtistDetailsSchema(BaseModel):
    makeup_types: List[str] = Field(
        default_factory=list
    )

    specialization: List[str] = Field(
        default_factory=list
    )

    brands_used: List[str] = Field(
        default_factory=list
    )

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


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE CREATE
# ─────────────────────────────────────────────────────────────────────────────

class ServiceCreate(BaseModel):
    service_name: str = Field(
        ...,
        min_length=3,
        max_length=150,
    )

    service_type: str

    description: Optional[str] = None

    add_line1: Optional[str] = None

    add_line2: Optional[str] = None

    area: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    country: str = "India"

    pincode: Optional[str] = None

    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
    )

    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
    )

    metadata_: Optional[ServiceMetadata] = Field(
        default=None,
    )

    variants: List[ServiceVariantCreate] = Field(
        default_factory=list
    )

    media_links: List[MediaLink] = Field(
        default_factory=list
    )

    # TYPE SPECIFIC
    venue: Optional[VenueDetailsSchema] = None

    catering: Optional[CateringDetailsSchema] = None

    dj: Optional[DjDetailsSchema] = None

    photography: Optional[
        PhotographyDetailsSchema
    ] = None

    event_management: Optional[
        EventManagementDetailsSchema
    ] = None

    makeup_artist: Optional[
        MakeupArtistDetailsSchema
    ] = None

    class Config:
        populate_by_name = True

    @field_validator("service_type")
    @classmethod
    def validate_service_type(cls, value: str):
        if value not in VALID_SERVICE_TYPES:
            raise ValueError(
                "Invalid service type"
            )
        return value


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE UPDATE
# ─────────────────────────────────────────────────────────────────────────────

class ServiceUpdate(BaseModel):
    service_name: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=150,
    )

    description: Optional[str] = None

    add_line1: Optional[str] = None

    add_line2: Optional[str] = None

    area: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    country: Optional[str] = None

    pincode: Optional[str] = None

    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
    )

    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
    )

    metadata_: Optional[ServiceMetadata] = Field(
        default=None,
    )

    variants: Optional[
        List[ServiceVariantCreate]
    ] = None

    media_links: Optional[
        List[MediaLink]
    ] = None

    # TYPE SPECIFIC
    venue: Optional[VenueDetailsSchema] = None

    catering: Optional[
        CateringDetailsSchema
    ] = None

    dj: Optional[DjDetailsSchema] = None

    photography: Optional[
        PhotographyDetailsSchema
    ] = None

    event_management: Optional[
        EventManagementDetailsSchema
    ] = None

    makeup_artist: Optional[
        MakeupArtistDetailsSchema
    ] = None

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# RESPONSES
# ─────────────────────────────────────────────────────────────────────────────

class ServiceCreateResponse(BaseModel):
    service_id: int

    moderation_status: str

    message: str


class VariantResponse(BaseModel):
    id: int

    variant_name: str

    description: Optional[str]

    min_quantity: Optional[int]

    max_quantity: Optional[int]

    pricing_type: str

    currency: str

    pricing: Dict[str, Any]

    menu: List[str]

    deliverables: List[str]

    inclusions: List[str]

    exclusions: List[str]

    policies: Dict[str, Any]

    is_default: bool

    is_active: bool

    metadata_: Dict[str, Any] = Field(
        default_factory=dict,
    )

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class ServiceResponse(BaseModel):
    id: int

    vendor_id: int

    service_name: str

    service_type: str

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

    metadata_: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
    )

    status: str

    is_active: bool

    is_verified: bool

    created_at: datetime

    updated_at: datetime

    # TYPE SPECIFIC
    venue: Optional[VenueDetailsSchema] = None

    catering: Optional[CateringDetailsSchema] = None

    photography: Optional[PhotographyDetailsSchema] = None

    dj: Optional[DjDetailsSchema] = None

    event_management: Optional[
        EventManagementDetailsSchema
    ] = None

    makeup_artist: Optional[
        MakeupArtistDetailsSchema
    ] = None

    media: List[ServiceMediaResponse] = Field(
        default_factory=list
    )

    variants: List[VariantResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True
        populate_by_name = True