CREATE TYPE lead_status AS ENUM (
  'new', 'accepted', 'engaged', 'unlocked', 'contacted', 'closed'
);


CREATE TABLE customer (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,

    add_line1       VARCHAR(150),
    add_line2       VARCHAR(150),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'India',
    pincode         VARCHAR(20),

    avatar          VARCHAR(255),
    phone           VARCHAR(20),

    is_verified     BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    last_login      TIMESTAMPTZ
);

CREATE INDEX idx_customer_email ON customer(email);


CREATE TABLE vendor (
    id                   BIGSERIAL PRIMARY KEY,
    email                VARCHAR(255) UNIQUE NOT NULL,
    hashed_password      VARCHAR(255) NOT NULL,

    first_name           VARCHAR(100) NOT NULL,
    last_name            VARCHAR(100) NOT NULL,

    add_line1            VARCHAR(150),
    add_line2            VARCHAR(150),
    city                 VARCHAR(100),
    state                VARCHAR(100),
    country              VARCHAR(100) DEFAULT 'India',
    pincode              VARCHAR(20),

    avatar               VARCHAR(255),
    phone                VARCHAR(20),

    is_verified          BOOLEAN DEFAULT FALSE,

    business_name        VARCHAR(150) NOT NULL,
    business_description TEXT,
    experience_years     SMALLINT DEFAULT 0,
    contact_person       VARCHAR(100),
    website              VARCHAR(255),

    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    last_login           TIMESTAMPTZ
);

CREATE INDEX idx_vendor_email ON vendor(email);
CREATE INDEX idx_vendor_business_name ON vendor(business_name);


CREATE TABLE services (
    id              BIGSERIAL PRIMARY KEY,
    vendor_id       BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,

    service_type    VARCHAR(50) NOT NULL,
    -- venue | catering | dj | photography | makeup | event_management

    service_name    VARCHAR(150) NOT NULL,
    description     TEXT,

    add_line1       VARCHAR(150),
    add_line2       VARCHAR(150),
    area            VARCHAR(100),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'India',
    pincode         VARCHAR(20),

    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),

    status          VARCHAR(30) DEFAULT 'draft',
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,

    metadata        JSONB,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_services_type_city ON services(service_type, city);
CREATE INDEX idx_services_status ON services(status);

CREATE TABLE service_media (
    id              BIGSERIAL PRIMARY KEY,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    media_url       TEXT NOT NULL,
    media_type      VARCHAR(20) DEFAULT 'image',
    -- image | video

    is_cover        BOOLEAN DEFAULT FALSE,
    display_order   INT DEFAULT 0,

    metadata        JSONB,
    -- alt_text, tags, etc.

    created_at      TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE venues (
    id                      BIGSERIAL PRIMARY KEY,
    service_id              BIGINT UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    venue_type              VARCHAR(50) NOT NULL,
    venue_nature            VARCHAR(20) NOT NULL,

    max_capacity            INTEGER NOT NULL,
    parking_capacity        INTEGER DEFAULT 0,

    venue_policies          JSONB NOT NULL DEFAULT '{}'::jsonb, 
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_type ON venues(venue_type);
CREATE INDEX idx_venue_capacity ON venues(max_capacity);
CREATE INDEX idx_venue_policies ON venues USING GIN (venue_policies);

CREATE TABLE service_variants (
    id              BIGSERIAL PRIMARY KEY,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    variant_name    VARCHAR(100) NOT NULL,
    description     TEXT,

    min_quantity    INTEGER,
    max_quantity    INTEGER,

    pricing_type    VARCHAR(50) NOT NULL,
    -- PER_PLATE | BASE_PRICE | PER_HOUR | PER_DAY | PER_EVENT | PACKAGE | CUSTOM | HYBRID

    currency        VARCHAR(10) DEFAULT 'INR',

    pricing         JSONB NOT NULL,
    -- structured flexible pricing

    menu            JSONB,
    deliverables    JSONB,
    inclusions      JSONB,
    exclusions      JSONB,
    policies        JSONB,
    metadata        JSONB,

    is_default      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (service_id, variant_name)
);

CREATE INDEX idx_variant_service ON service_variants(service_id);

CREATE INDEX idx_variant_pricing_type 
ON service_variants(pricing_type);

CREATE INDEX idx_variant_pricing_json 
ON service_variants USING GIN (pricing jsonb_path_ops);

CREATE TABLE wishlists (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    
    name            VARCHAR(150) NOT NULL,
    description     TEXT,

    is_default      BOOLEAN DEFAULT FALSE,
    is_public       BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE favorites (
    id              BIGSERIAL PRIMARY KEY,
    wishlist_id     BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    note            TEXT,
    priority        SMALLINT DEFAULT 0, -- 1 high, 2 medium, 3 low

    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (wishlist_id, service_id)
);

CREATE TABLE unavailable_dates (
    id              BIGSERIAL PRIMARY KEY,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    reason          VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unavailable_service_dates ON unavailable_dates(service_id, start_date, end_date);

CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,

    overall_rating  SMALLINT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    food_beverage_rating SMALLINT CHECK (food_beverage_rating >= 1 AND food_beverage_rating <= 5),
    service_quality_rating SMALLINT CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    ambiance_rating SMALLINT CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
    value_for_money_rating SMALLINT CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),

    title           VARCHAR(255),
    review_text     TEXT,
    
    event_type      VARCHAR(100),
    event_date      DATE,
    
    photos          JSONB,
    helpful_count   INT DEFAULT 0,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);


CREATE TYPE catering_service_style_enum AS ENUM (
    'buffet',
    'plated',
    'live_counter',
    'family_style'
);

CREATE TABLE catering_details (
    id                      BIGSERIAL PRIMARY KEY,
    service_id              BIGINT UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    -- Cuisine Types
    cuisine_types           JSONB NOT NULL DEFAULT '[]',
    -- ["indian", "chinese", "continental"]

    -- Meal Types
    meal_types              VARCHAR(20)[] DEFAULT ARRAY['lunch'],

    -- Pricing baseline (actual pricing handled in variants)
    veg_price_per_head      NUMERIC(10,2) CHECK (veg_price_per_head >= 0),
    non_veg_price_per_head  NUMERIC(10,2) CHECK (non_veg_price_per_head >= 0),

    -- Order constraints
    min_order               INT NOT NULL CHECK (min_order > 0),
    max_order               INT CHECK (max_order >= min_order),

    -- Multiple service styles
    service_styles          JSONB NOT NULL DEFAULT '[]',
    -- ["buffet", "live_counter"]

    -- Inclusions
    staff_included          BOOLEAN DEFAULT TRUE,
    crockery_cutlery_included BOOLEAN DEFAULT TRUE,
    tasting_available       BOOLEAN DEFAULT FALSE,

    -- Logistics
    setup_time_minutes      INT CHECK (setup_time_minutes >= 0),
    service_duration_minutes INT CHECK (service_duration_minutes >= 0),

    -- Travel & Area
    travel_cost_per_km      NUMERIC(10,2),
    base_city               VARCHAR(100),

    -- Tax
    gst_percentage          NUMERIC(5,2) DEFAULT 5.00,
    price_includes_tax      BOOLEAN DEFAULT FALSE,

    -- Dietary options (important in India)
    special_diets_supported JSONB DEFAULT '[]',
    -- ["jain", "vegan", "gluten_free"]

    -- Operational flags
    customizable_menu       BOOLEAN DEFAULT TRUE,
    is_active               BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catering_service ON catering_details(service_id);
CREATE INDEX idx_catering_cuisine ON catering_details USING GIN (cuisine_types);
CREATE INDEX idx_catering_styles ON catering_details USING GIN (service_styles);
CREATE INDEX idx_catering_diets ON catering_details USING GIN (special_diets_supported);


-- =========================
-- ENUMS
-- =========================
CREATE TYPE dj_event_type_enum AS ENUM (
    'wedding',
    'corporate',
    'birthday',
    'club',
    'private_party',
    'festival'
);

-- =========================
-- DJ DETAILS TABLE
-- =========================
CREATE TABLE dj_details (
    id                          BIGSERIAL PRIMARY KEY,
    service_id                  BIGINT UNIQUE NOT NULL 
                                REFERENCES services(id) ON DELETE CASCADE,

    -- 🎧 Music & Genres
    genres_supported            JSONB NOT NULL DEFAULT '[]',
    -- ["bollywood", "edm", "punjabi", "hiphop"]

    languages_supported         JSONB DEFAULT '[]',
    -- ["hindi", "english", "punjabi"]

    -- 🎪 Event Types (FIXED ENUM ARRAY)
    event_types_supported       dj_event_type_enum[] 
                                DEFAULT ARRAY['wedding']::dj_event_type_enum[],

    -- ⏱ Performance
    performance_duration_hours  NUMERIC(5,2) NOT NULL 
                                CHECK (performance_duration_hours > 0),

    overtime_rate_per_hour      NUMERIC(10,2)
                                CHECK (overtime_rate_per_hour >= 0),

    -- 🔊 Equipment
    equipments_provided         JSONB DEFAULT '[]',
    -- ["dj_console", "speakers", "wireless_mic"]

    sound_system_included       BOOLEAN DEFAULT TRUE,
    lighting_included           BOOLEAN DEFAULT FALSE,
    smoke_machine_included      BOOLEAN DEFAULT FALSE,
    led_wall_included           BOOLEAN DEFAULT FALSE,

    -- 🎤 Hosting / Engagement
    mc_host_available           BOOLEAN DEFAULT FALSE,
    crowd_interaction_level     VARCHAR(20),
    -- low | medium | high

    -- ⚙️ Setup
    setup_time_minutes          INT CHECK (setup_time_minutes >= 0),
    teardown_time_minutes       INT CHECK (teardown_time_minutes >= 0),

    -- ⚡ Power (Important in India)
    power_requirement_kw        NUMERIC(5,2),
    backup_power_required       BOOLEAN DEFAULT FALSE,

    -- 🚚 Travel
    travel_cost_per_km          NUMERIC(10,2),
    base_city                   VARCHAR(100),

    -- 🌙 Restrictions (India-specific)
    outdoor_supported           BOOLEAN DEFAULT TRUE,
    late_night_allowed          BOOLEAN DEFAULT TRUE,
    sound_license_required      BOOLEAN DEFAULT TRUE,

    -- 🎵 Customization
    custom_playlist_allowed     BOOLEAN DEFAULT TRUE,
    playlist_link_supported     BOOLEAN DEFAULT TRUE,

    -- 📊 Marketplace Meta
    experience_years            SMALLINT DEFAULT 0,
    rating                      NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    total_events_performed      INT DEFAULT 0,

    -- ✅ Status
    is_active                   BOOLEAN DEFAULT TRUE,

    -- 🕒 Audit
    created_at                  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEXES (IMPORTANT)
-- =========================

-- FK Index
CREATE INDEX idx_dj_service 
ON dj_details(service_id);

-- JSONB Indexes (Fast Filtering)
CREATE INDEX idx_dj_genres 
ON dj_details USING GIN (genres_supported);

CREATE INDEX idx_dj_languages 
ON dj_details USING GIN (languages_supported);

CREATE INDEX idx_dj_equipments 
ON dj_details USING GIN (equipments_provided);

-- ENUM ARRAY Index
CREATE INDEX idx_dj_event_types 
ON dj_details USING GIN (event_types_supported);


-- =========================
-- PHOTOGRAPHY TABLE
-- =========================
CREATE TABLE photography_details (
    id                      BIGSERIAL PRIMARY KEY,
    service_id              BIGINT UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    -- 📷 Type of Photography
    photography_types       JSONB NOT NULL DEFAULT '[]',
    -- ["wedding", "pre_wedding", "candid", "traditional", "fashion"]

    -- 🎥 Videography
    videography_available   BOOLEAN DEFAULT FALSE,
    drone_shoot_available   BOOLEAN DEFAULT FALSE,

    -- 📦 Deliverables
    photo_delivery_count    INT,
    video_delivery_duration_minutes INT,

    edited_photos_included  BOOLEAN DEFAULT TRUE,
    raw_photos_provided     BOOLEAN DEFAULT FALSE,

    album_included          BOOLEAN DEFAULT FALSE,
    album_pages             INT,

    -- ⏱ Duration
    coverage_hours          NUMERIC(5,2),
    overtime_rate_per_hour  NUMERIC(10,2),

    -- 👥 Team
    team_size               INT DEFAULT 1,
    second_shooter_included BOOLEAN DEFAULT FALSE,

    -- 🎨 Editing Style
    editing_styles          JSONB DEFAULT '[]',
    -- ["cinematic", "traditional", "documentary"]

    -- 📍 Travel
    travel_cost_per_km      NUMERIC(10,2),
    base_city               VARCHAR(100),

    -- 📊 Meta
    experience_years        SMALLINT DEFAULT 0,
    rating                  NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    total_events_covered    INT DEFAULT 0,

    is_active               BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_photo_service ON photography_details(service_id);
CREATE INDEX idx_photo_types ON photography_details USING GIN (photography_types);
CREATE INDEX idx_photo_editing ON photography_details USING GIN (editing_styles);



-- =========================
-- EVENT MANAGEMENT TABLE
-- =========================
CREATE TABLE event_management_details (
    id                      BIGSERIAL PRIMARY KEY,
    service_id              BIGINT UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    -- 🎪 Event Types
    event_types_supported   JSONB NOT NULL DEFAULT '[]',
    -- ["wedding", "corporate", "birthday", "engagement"]

    -- 📋 Services Offered
    services_offered        JSONB DEFAULT '[]',
    -- ["planning", "decoration", "vendor_management", "logistics"]

    -- 🎨 Themes
    themes_supported        JSONB DEFAULT '[]',
    -- ["royal", "beach", "traditional", "modern"]

    -- 👥 Team
    team_size               INT,
    on_site_managers        INT DEFAULT 1,

    -- 📦 Inclusions
    decoration_included     BOOLEAN DEFAULT FALSE,
    catering_management     BOOLEAN DEFAULT FALSE,
    entertainment_management BOOLEAN DEFAULT FALSE,

    -- ⏱ Planning
    planning_duration_days  INT,
    setup_time_hours        NUMERIC(5,2),

    -- 💰 Budget Range
    min_budget              NUMERIC(12,2),
    max_budget              NUMERIC(12,2),

    -- 📍 Travel
    travel_cost_per_km      NUMERIC(10,2),
    base_city               VARCHAR(100),

    -- 📊 Meta
    experience_years        SMALLINT DEFAULT 0,
    rating                  NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    total_events_managed    INT DEFAULT 0,

    is_active               BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_budget_valid CHECK (
        max_budget IS NULL OR min_budget IS NULL OR max_budget >= min_budget
    )
);

-- Indexes
CREATE INDEX idx_event_service ON event_management_details(service_id);
CREATE INDEX idx_event_types ON event_management_details USING GIN (event_types_supported);
CREATE INDEX idx_event_services ON event_management_details USING GIN (services_offered);



-- =========================
-- MAKEUP ARTIST TABLE
-- =========================
CREATE TABLE makeup_artist_details (
    id                      BIGSERIAL PRIMARY KEY,
    service_id              BIGINT UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    -- 💄 Makeup Types
    makeup_types            JSONB NOT NULL DEFAULT '[]',
    -- ["bridal", "party", "hd_makeup", "airbrush"]

    -- 👰 Specialization
    specialization          JSONB NOT NULL DEFAULT '[]',
    -- bridal | fashion | celebrity

    -- 🧴 Products
    brands_used             JSONB DEFAULT '[]',
    -- ["MAC", "Huda Beauty", "Lakme"]

    premium_products_used   BOOLEAN DEFAULT TRUE,

    -- 👥 Team
    team_size               INT DEFAULT 1,

    -- ⏱ Duration
    service_duration_minutes INT,
    travel_to_client        BOOLEAN DEFAULT TRUE,

    -- 📍 Travel
    travel_cost_per_km      NUMERIC(10,2),
    base_city               VARCHAR(100),

    -- 🎁 Add-ons
    hairstyling_included    BOOLEAN DEFAULT TRUE,
    draping_included        BOOLEAN DEFAULT FALSE,
    trial_available         BOOLEAN DEFAULT FALSE,

    -- 📊 Meta
    experience_years        SMALLINT DEFAULT 0,
    rating                  NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    total_clients_served    INT DEFAULT 0,

    is_active               BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_makeup_service ON makeup_artist_details(service_id);
CREATE INDEX idx_makeup_types ON makeup_artist_details USING GIN (makeup_types);
CREATE INDEX idx_makeup_brands ON makeup_artist_details USING GIN (brands_used);



CREATE TABLE leads ( 
    id BIGSERIAL PRIMARY KEY, 
    user_id BIGINT NOT NULL, 
    vendor_id BIGINT NOT NULL, name VARCHAR(100), 
    phone VARCHAR(20), 
    email VARCHAR(100), 
    event_type VARCHAR(50), 
    event_date DATE, 
    event_time TIME, 
    location VARCHAR(255), 
    budget_range VARCHAR(50), 
    guests INTEGER, 
    description TEXT, 
    status VARCHAR(20) DEFAULT 'new', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );


CREATE TABLE lead_actions (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
    vendor_id BIGINT NOT NULL,

    action VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_leads ON leads(vendor_id);
CREATE INDEX idx_user_leads ON leads(user_id);


CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,

    recipient_id BIGINT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL, -- "customer" | "vendor"

    type VARCHAR(50), -- "new_lead", "quote_received", etc

    title VARCHAR(255),
    message TEXT,

    data JSONB, -- payload (lead_id, quote_id etc)

    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient 
ON notifications(recipient_id, recipient_type);