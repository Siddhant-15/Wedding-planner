-- =============================================================
-- WEDDING MARKETPLACE DATABASE SCHEMA
-- Production-Ready Version
-- =============================================================


-- =============================================================
-- SECTION 1: ENUMS
-- =============================================================

CREATE TYPE service_status AS ENUM (
    'draft',
    'under_review',
    'live',
    'inactive',
    'suspended',
    'needs_revision'
);

CREATE TYPE service_version_status AS ENUM (
    'draft',
    'under_review',
    'approved',
    'published',
    'rejected',
    'archived',
    'needs_revision'
);

-- Fix #5: service_type as enum (was VARCHAR(50))
CREATE TYPE service_type_enum AS ENUM (
    'venue',
    'catering',
    'dj',
    'photography',
    'makeup_artist',
    'event_management'
);

-- Fix #8: lead_status enum (was VARCHAR(20))
CREATE TYPE lead_status AS ENUM (
    'new',
    'accepted',
    'engaged',
    'unlocked',
    'contacted',
    'closed'
);

-- Fix #9: customer_lead_status enum (was VARCHAR(50))
CREATE TYPE customer_lead_status AS ENUM (
    'REQUEST_SUBMITTED',
    'VENDOR_VIEWED',
    'CONTACT_UNLOCKED',
    'CONTACTED',
    'NEGOTIATION',
    'BOOKED',
    'CANCELLED'
);

-- Fix #17: notification_type enum (was VARCHAR(50))
CREATE TYPE notification_type_enum AS ENUM (
    'new_lead',
    'quote_received',
    'booking_created',
    'booking_confirmed',
    'service_approved',
    'service_rejected',
    'subscription_expiring'
);

-- Fix #22: vendor_verification_status enum (replaces is_verified BOOLEAN)
CREATE TYPE vendor_verification_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'suspended'
);

-- Fix #12: admin role enum
CREATE TYPE admin_role_enum AS ENUM (
    'super_admin',
    'reviewer',
    'operations',
    'support'
);

CREATE TYPE catering_service_style_enum AS ENUM (
    'buffet',
    'plated',
    'live_counter',
    'family_style'
);

CREATE TYPE dj_event_type_enum AS ENUM (
    'wedding',
    'corporate',
    'birthday',
    'club',
    'private_party',
    'festival'
);


-- =============================================================
-- SECTION 2: UPDATED_AT TRIGGER FUNCTION
-- Fix #19: Generic trigger to auto-update updated_at
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- SECTION 3: CORE USER TABLES
-- =============================================================

-- Fix #10: deleted_at added for soft delete
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
    last_login      TIMESTAMPTZ,

    -- Fix #10: soft delete
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_customer_email ON customer(email);
CREATE INDEX idx_customer_deleted ON customer(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_customer_updated_at
    BEFORE UPDATE ON customer
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Fix #10: deleted_at added for soft delete
-- Fix #22: is_verified BOOLEAN -> verification_status ENUM
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

    -- Fix #22: was is_verified BOOLEAN
    verification_status  vendor_verification_status NOT NULL DEFAULT 'pending',

    business_name        VARCHAR(150) NOT NULL,
    business_description TEXT,
    experience_years     SMALLINT DEFAULT 0,
    contact_person       VARCHAR(100),
    website              VARCHAR(255),

    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    last_login           TIMESTAMPTZ,

    -- Fix #10: soft delete
    deleted_at           TIMESTAMPTZ
);

CREATE INDEX idx_vendor_email ON vendor(email);
CREATE INDEX idx_vendor_business_name ON vendor(business_name);
CREATE INDEX idx_vendor_deleted ON vendor(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_vendor_updated_at
    BEFORE UPDATE ON vendor
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Fix #12: Admin user table (was missing entirely)
CREATE TABLE admins (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    role            admin_role_enum NOT NULL DEFAULT 'reviewer',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_admins_email ON admins(email);

CREATE TRIGGER trg_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 4: SERVICES (no circular FK at creation time)
-- Fix #1: Circular FK resolved by creating services first,
--         then service_versions, then ALTER TABLE to add FKs
-- =============================================================

-- Fix #2: Removed lifecycle_status (duplicate of status)
-- Fix #5: service_type is now service_type_enum
-- Fix #10: soft delete added
CREATE TABLE services (
    id                       BIGSERIAL PRIMARY KEY,
    vendor_id                BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,

    -- FK constraints added after service_versions is created (see below)
    current_live_version_id  BIGINT,
    current_draft_version_id BIGINT,

    -- Fix #5: was VARCHAR(50)
    service_type             service_type_enum NOT NULL,

    -- Fix #2: removed lifecycle_status; single status field
    status                   service_status NOT NULL DEFAULT 'draft',

    is_active                BOOLEAN DEFAULT TRUE,

    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW(),

    -- Fix #10: soft delete
    deleted_at               TIMESTAMPTZ
);

CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_deleted ON services(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 5: SERVICE VERSIONS
-- Fix #11: Added approval audit columns
-- Fix #10: Soft delete
-- Fix #18: PostGIS location column
-- Fix #20: Full-text search vector
-- =============================================================

CREATE TABLE service_versions (
    id              BIGSERIAL PRIMARY KEY,

    service_id      BIGINT NOT NULL
        REFERENCES services(id)
        ON DELETE CASCADE,

    version_number  INTEGER NOT NULL,

    status          service_version_status NOT NULL DEFAULT 'draft',

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

    -- Fix #18: PostGIS geography column for geospatial queries
    -- Requires: CREATE EXTENSION postgis;
    -- location     GEOGRAPHY(Point, 4326),

    -- Fix #20: Full-text search vector
    search_vector   TSVECTOR,

    metadata        JSONB,

    submitted_at    TIMESTAMPTZ,

    -- Fix #11: Expanded approval audit (was only reviewed_by, reviewed_at)
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     BIGINT REFERENCES admins(id),

    approved_at     TIMESTAMPTZ,
    approved_by     BIGINT REFERENCES admins(id),

    rejected_at     TIMESTAMPTZ,
    rejected_by     BIGINT REFERENCES admins(id),

    rejection_reason TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    -- Fix #10: soft delete
    deleted_at      TIMESTAMPTZ,

    UNIQUE (service_id, version_number)
);

CREATE INDEX idx_service_versions_city    ON service_versions(city);
CREATE INDEX idx_service_versions_state   ON service_versions(state);
CREATE INDEX idx_service_versions_location ON service_versions(city, state);
CREATE INDEX idx_service_versions_deleted ON service_versions(deleted_at) WHERE deleted_at IS NULL;

-- Fix #20: GIN index for full-text search
CREATE INDEX idx_service_search ON service_versions USING GIN(search_vector);

-- Fix #18: Uncomment when PostGIS extension is enabled
-- CREATE INDEX idx_service_location ON service_versions USING GIST(location);

-- Fix #20: Trigger to maintain search_vector
CREATE OR REPLACE FUNCTION update_service_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector('english', COALESCE(NEW.service_name, ''))
        || to_tsvector('english', COALESCE(NEW.description, ''))
        || to_tsvector('english', COALESCE(NEW.city, ''))
        || to_tsvector('english', COALESCE(NEW.area, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_versions_search
    BEFORE INSERT OR UPDATE ON service_versions
    FOR EACH ROW EXECUTE FUNCTION update_service_search_vector();

CREATE TRIGGER trg_service_versions_updated_at
    BEFORE UPDATE ON service_versions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Fix #1: Now that service_versions exists, add the circular FK constraints
ALTER TABLE services
    ADD CONSTRAINT fk_service_live_version
    FOREIGN KEY (current_live_version_id)
    REFERENCES service_versions(id)
    DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE services
    ADD CONSTRAINT fk_service_draft_version
    FOREIGN KEY (current_draft_version_id)
    REFERENCES service_versions(id)
    DEFERRABLE INITIALLY DEFERRED;


-- =============================================================
-- SECTION 6: SERVICE VERSION AUDIT LOG
-- Fix #13: Missing version change log
-- =============================================================

CREATE TABLE service_version_audit (
    id                  BIGSERIAL PRIMARY KEY,
    service_version_id  BIGINT NOT NULL REFERENCES service_versions(id) ON DELETE CASCADE,
    action              VARCHAR(50) NOT NULL,
    -- e.g. 'submitted', 'approved', 'rejected', 'archived', 'edited'
    performed_by        BIGINT,  -- admin or vendor id
    performed_by_type   VARCHAR(20), -- 'admin' | 'vendor'
    old_data            JSONB,
    new_data            JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sva_version ON service_version_audit(service_version_id);
CREATE INDEX idx_sva_performed_by ON service_version_audit(performed_by);


-- =============================================================
-- SECTION 7: SERVICE MEDIA
-- Fix #21: media_type CHECK constraint + unique cover image
-- =============================================================

CREATE TABLE service_media (
    id                 BIGSERIAL PRIMARY KEY,

    service_version_id BIGINT NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    media_url          TEXT NOT NULL,

    -- Fix #21: CHECK constraint on media_type
    media_type         VARCHAR(20) NOT NULL
        CHECK (media_type IN ('image', 'video')),

    is_cover           BOOLEAN DEFAULT FALSE,
    display_order      INT DEFAULT 0,
    metadata           JSONB,

    created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Fix #21: Only one cover image per service version
CREATE UNIQUE INDEX idx_media_unique_cover
    ON service_media(service_version_id)
    WHERE is_cover = TRUE;

CREATE INDEX idx_media_version ON service_media(service_version_id);


-- =============================================================
-- SECTION 8: SERVICE VARIANTS
-- Fix #4: service_variants now linked to service_version_id
-- =============================================================

CREATE TABLE service_variants (
    id              BIGSERIAL PRIMARY KEY,

    -- Fix #4: was service_id; now versioned
    service_version_id BIGINT NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    variant_name    VARCHAR(100) NOT NULL,
    description     TEXT,

    min_quantity    INTEGER,
    max_quantity    INTEGER,

    -- PER_PLATE | BASE_PRICE | PER_HOUR | PER_DAY | PER_EVENT | PACKAGE | CUSTOM | HYBRID
    pricing_type    VARCHAR(50) NOT NULL,

    currency        VARCHAR(10) DEFAULT 'INR',

    pricing         JSONB NOT NULL,
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

    UNIQUE (service_version_id, variant_name)
);

CREATE INDEX idx_variant_version ON service_variants(service_version_id);
CREATE INDEX idx_variant_pricing_type ON service_variants(pricing_type);
CREATE INDEX idx_variant_pricing_json ON service_variants USING GIN(pricing jsonb_path_ops);

CREATE TRIGGER trg_service_variants_updated_at
    BEFORE UPDATE ON service_variants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 9: SERVICE-TYPE-SPECIFIC DETAIL TABLES
-- Fix #3: venues now linked to service_version_id (not service_id)
-- =============================================================

-- Fix #3: was service_id UNIQUE; now service_version_id
CREATE TABLE venues (
    id                  BIGSERIAL PRIMARY KEY,

    -- Fix #3: was REFERENCES services(id)
    service_version_id  BIGINT UNIQUE NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    venue_type          VARCHAR(50) NOT NULL,
    venue_nature        VARCHAR(20) NOT NULL,

    max_capacity        INTEGER NOT NULL,
    min_capacity        INTEGER NOT NULL,
    square_feet         NUMERIC(10,2),
    parking_capacity    INTEGER DEFAULT 0,

    venue_policies      JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_type ON venues(venue_type);
CREATE INDEX idx_venue_capacity ON venues(max_capacity);
CREATE INDEX idx_venue_policies ON venues USING GIN(venue_policies);
CREATE INDEX idx_venue_version ON venues(service_version_id);

CREATE TRIGGER trg_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE catering_details (
    id                         BIGSERIAL PRIMARY KEY,

    service_version_id         BIGINT UNIQUE NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    cuisine_types              JSONB NOT NULL DEFAULT '[]',
    meal_types                 VARCHAR(20)[] DEFAULT ARRAY['lunch'],

    veg_price_per_head         NUMERIC(10,2) CHECK (veg_price_per_head >= 0),
    non_veg_price_per_head     NUMERIC(10,2) CHECK (non_veg_price_per_head >= 0),

    min_order                  INT NOT NULL CHECK (min_order > 0),
    max_order                  INT,

    service_styles             JSONB NOT NULL DEFAULT '[]',

    staff_included             BOOLEAN DEFAULT TRUE,
    crockery_cutlery_included  BOOLEAN DEFAULT TRUE,
    tasting_available          BOOLEAN DEFAULT FALSE,

    setup_time_minutes         INT CHECK (setup_time_minutes >= 0),
    service_duration_minutes   INT CHECK (service_duration_minutes >= 0),

    travel_cost_per_km         NUMERIC(10,2),
    base_city                  VARCHAR(100),

    gst_percentage             NUMERIC(5,2) DEFAULT 5.00,
    price_includes_tax         BOOLEAN DEFAULT FALSE,

    special_diets_supported    JSONB DEFAULT '[]',
    customizable_menu          BOOLEAN DEFAULT TRUE,
    is_active                  BOOLEAN DEFAULT TRUE,

    created_at                 TIMESTAMPTZ DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_catering_max_order
        CHECK (max_order IS NULL OR max_order >= min_order)
);

CREATE INDEX idx_catering_version ON catering_details(service_version_id);
CREATE INDEX idx_catering_cuisine  ON catering_details USING GIN(cuisine_types);
CREATE INDEX idx_catering_styles   ON catering_details USING GIN(service_styles);
CREATE INDEX idx_catering_diets    ON catering_details USING GIN(special_diets_supported);

CREATE TRIGGER trg_catering_updated_at
    BEFORE UPDATE ON catering_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE dj_details (
    id                         BIGSERIAL PRIMARY KEY,

    service_version_id         BIGINT UNIQUE NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    genres_supported           JSONB NOT NULL DEFAULT '[]',
    languages_supported        JSONB DEFAULT '[]',

    event_types_supported      dj_event_type_enum[]
        DEFAULT ARRAY['wedding']::dj_event_type_enum[],

    performance_duration_hours NUMERIC(5,2) NOT NULL CHECK (performance_duration_hours > 0),
    overtime_rate_per_hour     NUMERIC(10,2) CHECK (overtime_rate_per_hour >= 0),

    equipments_provided        JSONB DEFAULT '[]',

    sound_system_included      BOOLEAN DEFAULT TRUE,
    lighting_included          BOOLEAN DEFAULT FALSE,
    smoke_machine_included     BOOLEAN DEFAULT FALSE,
    led_wall_included          BOOLEAN DEFAULT FALSE,
    mc_host_available          BOOLEAN DEFAULT FALSE,

    crowd_interaction_level    VARCHAR(20)
        CHECK (crowd_interaction_level IS NULL OR crowd_interaction_level IN ('low','medium','high')),

    setup_time_minutes         INT CHECK (setup_time_minutes >= 0),
    teardown_time_minutes      INT CHECK (teardown_time_minutes >= 0),
    power_requirement_kw       NUMERIC(5,2),
    backup_power_required      BOOLEAN DEFAULT FALSE,

    travel_cost_per_km         NUMERIC(10,2),
    base_city                  VARCHAR(100),

    outdoor_supported          BOOLEAN DEFAULT TRUE,
    late_night_allowed         BOOLEAN DEFAULT TRUE,
    sound_license_required     BOOLEAN DEFAULT TRUE,
    custom_playlist_allowed    BOOLEAN DEFAULT TRUE,
    playlist_link_supported    BOOLEAN DEFAULT TRUE,

    experience_years           SMALLINT DEFAULT 0,
    total_events_performed     INT DEFAULT 0,
    is_active                  BOOLEAN DEFAULT TRUE,

    created_at                 TIMESTAMPTZ DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dj_version     ON dj_details(service_version_id);
CREATE INDEX idx_dj_genres      ON dj_details USING GIN(genres_supported);
CREATE INDEX idx_dj_languages   ON dj_details USING GIN(languages_supported);
CREATE INDEX idx_dj_equipment   ON dj_details USING GIN(equipments_provided);
CREATE INDEX idx_dj_event_types ON dj_details USING GIN(event_types_supported);

CREATE TRIGGER trg_dj_updated_at
    BEFORE UPDATE ON dj_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE photography_details (
    id                             BIGSERIAL PRIMARY KEY,

    service_version_id             BIGINT UNIQUE NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    photography_types              JSONB NOT NULL DEFAULT '[]',
    videography_available          BOOLEAN DEFAULT FALSE,
    drone_shoot_available          BOOLEAN DEFAULT FALSE,

    photo_delivery_count           INT,
    video_delivery_duration_minutes INT,

    edited_photos_included         BOOLEAN DEFAULT TRUE,
    raw_photos_provided            BOOLEAN DEFAULT FALSE,
    album_included                 BOOLEAN DEFAULT FALSE,
    album_pages                    INT,

    coverage_hours                 NUMERIC(5,2),
    overtime_rate_per_hour         NUMERIC(10,2),

    team_size                      INT DEFAULT 1,
    second_shooter_included        BOOLEAN DEFAULT FALSE,

    editing_styles                 JSONB DEFAULT '[]',
    travel_cost_per_km             NUMERIC(10,2),
    base_city                      VARCHAR(100),

    experience_years               SMALLINT DEFAULT 0,
    total_events_covered           INT DEFAULT 0,
    is_active                      BOOLEAN DEFAULT TRUE,

    created_at                     TIMESTAMPTZ DEFAULT NOW(),
    updated_at                     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photo_version  ON photography_details(service_version_id);
CREATE INDEX idx_photo_types    ON photography_details USING GIN(photography_types);
CREATE INDEX idx_photo_editing  ON photography_details USING GIN(editing_styles);

CREATE TRIGGER trg_photography_updated_at
    BEFORE UPDATE ON photography_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE event_management_details (
    id                              BIGSERIAL PRIMARY KEY,

    service_version_id              BIGINT UNIQUE NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    event_types_supported           JSONB NOT NULL DEFAULT '[]',
    services_offered                JSONB DEFAULT '[]',
    themes_supported                JSONB DEFAULT '[]',

    team_size                       INT CHECK (team_size IS NULL OR team_size > 0),
    on_site_managers                INT DEFAULT 1 CHECK (on_site_managers > 0),

    decoration_included             BOOLEAN DEFAULT FALSE,
    catering_management             BOOLEAN DEFAULT FALSE,
    entertainment_management        BOOLEAN DEFAULT FALSE,
    vendor_coordination_included    BOOLEAN DEFAULT FALSE,
    guest_management_included       BOOLEAN DEFAULT FALSE,
    logistics_management_included   BOOLEAN DEFAULT FALSE,

    planning_duration_days          INT CHECK (planning_duration_days IS NULL OR planning_duration_days >= 0),
    setup_time_hours                NUMERIC(5,2) CHECK (setup_time_hours IS NULL OR setup_time_hours >= 0),
    teardown_time_hours             NUMERIC(5,2) CHECK (teardown_time_hours IS NULL OR teardown_time_hours >= 0),

    min_budget                      NUMERIC(12,2) CHECK (min_budget IS NULL OR min_budget >= 0),
    max_budget                      NUMERIC(12,2) CHECK (max_budget IS NULL OR max_budget >= 0),

    travel_cost_per_km              NUMERIC(10,2) CHECK (travel_cost_per_km IS NULL OR travel_cost_per_km >= 0),
    base_city                       VARCHAR(100),
    serviceable_cities              JSONB DEFAULT '[]',

    experience_years                SMALLINT DEFAULT 0 CHECK (experience_years >= 0),
    total_events_managed            INT DEFAULT 0 CHECK (total_events_managed >= 0),
    is_active                       BOOLEAN DEFAULT TRUE,

    version_notes                   TEXT,
    created_by                      BIGINT,
    updated_by                      BIGINT,

    created_at                      TIMESTAMPTZ DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_event_budget_valid
        CHECK (max_budget IS NULL OR min_budget IS NULL OR max_budget >= min_budget)
);

CREATE INDEX idx_event_version           ON event_management_details(service_version_id);
CREATE INDEX idx_event_types             ON event_management_details USING GIN(event_types_supported);
CREATE INDEX idx_event_services          ON event_management_details USING GIN(services_offered);
CREATE INDEX idx_event_themes            ON event_management_details USING GIN(themes_supported);
CREATE INDEX idx_event_serviceable_cities ON event_management_details USING GIN(serviceable_cities);

CREATE TRIGGER trg_event_management_updated_at
    BEFORE UPDATE ON event_management_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE makeup_artist_details (
    id                      BIGSERIAL PRIMARY KEY,

    service_version_id      BIGINT UNIQUE NOT NULL
        REFERENCES service_versions(id)
        ON DELETE CASCADE,

    makeup_types            JSONB NOT NULL DEFAULT '[]',
    specialization          JSONB NOT NULL DEFAULT '[]',
    brands_used             JSONB DEFAULT '[]',
    premium_products_used   BOOLEAN DEFAULT TRUE,

    team_size               INT DEFAULT 1 CHECK (team_size > 0),
    assistants_count        INT DEFAULT 0 CHECK (assistants_count >= 0),

    service_duration_minutes INT CHECK (service_duration_minutes IS NULL OR service_duration_minutes > 0),
    travel_to_client        BOOLEAN DEFAULT TRUE,

    travel_cost_per_km      NUMERIC(10,2) CHECK (travel_cost_per_km IS NULL OR travel_cost_per_km >= 0),
    base_city               VARCHAR(100),
    serviceable_cities      JSONB DEFAULT '[]',

    hairstyling_included    BOOLEAN DEFAULT TRUE,
    draping_included        BOOLEAN DEFAULT FALSE,
    nail_art_available      BOOLEAN DEFAULT FALSE,
    trial_available         BOOLEAN DEFAULT FALSE,
    paid_trial_available    BOOLEAN DEFAULT FALSE,
    trial_cost              NUMERIC(10,2) CHECK (trial_cost IS NULL OR trial_cost >= 0),

    experience_years        SMALLINT DEFAULT 0 CHECK (experience_years >= 0),
    total_clients_served    INT DEFAULT 0 CHECK (total_clients_served >= 0),
    total_bridal_bookings   INT DEFAULT 0 CHECK (total_bridal_bookings >= 0),
    is_active               BOOLEAN DEFAULT TRUE,

    version_notes           TEXT,
    created_by              BIGINT,
    updated_by              BIGINT,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_makeup_version           ON makeup_artist_details(service_version_id);
CREATE INDEX idx_makeup_types             ON makeup_artist_details USING GIN(makeup_types);
CREATE INDEX idx_makeup_specialization    ON makeup_artist_details USING GIN(specialization);
CREATE INDEX idx_makeup_brands            ON makeup_artist_details USING GIN(brands_used);
CREATE INDEX idx_makeup_serviceable_cities ON makeup_artist_details USING GIN(serviceable_cities);

CREATE TRIGGER trg_makeup_updated_at
    BEFORE UPDATE ON makeup_artist_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 10: REVIEWS + RATING SUMMARY
-- Fix #6: service_rating_summary table added
-- Fix #10: soft delete on reviews
-- =============================================================

CREATE TABLE reviews (
    id                      BIGSERIAL PRIMARY KEY,
    service_id              BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    user_id                 BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,

    overall_rating          SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    food_beverage_rating    SMALLINT CHECK (food_beverage_rating BETWEEN 1 AND 5),
    service_quality_rating  SMALLINT CHECK (service_quality_rating BETWEEN 1 AND 5),
    ambiance_rating         SMALLINT CHECK (ambiance_rating BETWEEN 1 AND 5),
    value_for_money_rating  SMALLINT CHECK (value_for_money_rating BETWEEN 1 AND 5),

    title                   VARCHAR(255),
    review_text             TEXT,

    event_type              VARCHAR(100),
    event_date              DATE,

    photos                  JSONB,
    helpful_count           INT DEFAULT 0,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    -- Fix #10: soft delete
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_user    ON reviews(user_id);
CREATE INDEX idx_reviews_deleted ON reviews(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Fix #6: Rating summary table updated by trigger
CREATE TABLE service_rating_summary (
    id              BIGSERIAL PRIMARY KEY,
    service_id      BIGINT UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    average_rating  NUMERIC(3,2) DEFAULT 0,
    total_reviews   INTEGER DEFAULT 0,
    -- breakdown: {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    rating_breakdown JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rating_summary_service ON service_rating_summary(service_id);

-- Fix #6: Trigger to maintain rating summary
CREATE OR REPLACE FUNCTION update_service_rating_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_service_id BIGINT;
    v_avg NUMERIC(3,2);
    v_total INTEGER;
    v_breakdown JSONB;
BEGIN
    v_service_id := COALESCE(NEW.service_id, OLD.service_id);

    SELECT
        ROUND(AVG(overall_rating)::NUMERIC, 2),
        COUNT(*),
        jsonb_build_object(
            '1', COUNT(*) FILTER (WHERE overall_rating = 1),
            '2', COUNT(*) FILTER (WHERE overall_rating = 2),
            '3', COUNT(*) FILTER (WHERE overall_rating = 3),
            '4', COUNT(*) FILTER (WHERE overall_rating = 4),
            '5', COUNT(*) FILTER (WHERE overall_rating = 5)
        )
    INTO v_avg, v_total, v_breakdown
    FROM reviews
    WHERE service_id = v_service_id
      AND deleted_at IS NULL;

    INSERT INTO service_rating_summary (service_id, average_rating, total_reviews, rating_breakdown, updated_at)
    VALUES (v_service_id, COALESCE(v_avg, 0), COALESCE(v_total, 0), v_breakdown, NOW())
    ON CONFLICT (service_id) DO UPDATE
        SET average_rating   = EXCLUDED.average_rating,
            total_reviews    = EXCLUDED.total_reviews,
            rating_breakdown = EXCLUDED.rating_breakdown,
            updated_at       = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating_summary
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_service_rating_summary();


-- =============================================================
-- SECTION 11: WISHLISTS & FAVORITES
-- =============================================================

CREATE TABLE wishlists (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    is_default  BOOLEAN DEFAULT FALSE,
    is_public   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_wishlists_updated_at
    BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE favorites (
    id          BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    service_id  BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    note        TEXT,
    priority    SMALLINT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (wishlist_id, service_id)
);


-- =============================================================
-- SECTION 12: AVAILABILITY
-- =============================================================

CREATE TABLE unavailable_dates (
    id          BIGSERIAL PRIMARY KEY,
    service_id  BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    reason      VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unavailable_service_dates ON unavailable_dates(service_id, start_date, end_date);

CREATE TRIGGER trg_unavailable_updated_at
    BEFORE UPDATE ON unavailable_dates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE vendor_unavailable_dates (
    id          BIGSERIAL PRIMARY KEY,

    vendor_id   BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    service_id  BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    start_date  TIMESTAMP NOT NULL,
    end_date    TIMESTAMP NOT NULL,

    reason      VARCHAR(255),

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_unavailable_vendor_dates ON vendor_unavailable_dates(vendor_id, start_date, end_date);
CREATE INDEX idx_unavailable_service      ON vendor_unavailable_dates(service_id);

CREATE TRIGGER trg_vendor_unavailable_updated_at
    BEFORE UPDATE ON vendor_unavailable_dates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 13: LEADS
-- Fix #7: Added FK constraints (were missing)
-- Fix #8: status uses lead_status enum
-- Fix #9: customer_status uses customer_lead_status enum
-- =============================================================

CREATE TABLE leads (
    id              BIGSERIAL PRIMARY KEY,

    -- Fix #7: FK constraints added
    user_id         BIGINT NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
    vendor_id       BIGINT NOT NULL REFERENCES vendor(id) ON DELETE RESTRICT,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,

    service_type    service_type_enum,

    name            VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(100),

    event_type      VARCHAR(50),
    event_date      DATE,
    event_time      TIME,

    location        VARCHAR(255),
    budget_range    VARCHAR(50),
    guests          INTEGER,
    description     TEXT,

    -- Fix #8: was VARCHAR(20)
    status          lead_status NOT NULL DEFAULT 'new',

    -- Fix #9: was VARCHAR(50)
    customer_status customer_lead_status NOT NULL DEFAULT 'REQUEST_SUBMITTED',

    phone_unlocked  BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_leads   ON leads(vendor_id);
CREATE INDEX idx_user_leads     ON leads(user_id);
CREATE INDEX idx_service_leads  ON leads(service_id);
CREATE INDEX idx_event_date     ON leads(event_date);

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE lead_actions (
    id          BIGSERIAL PRIMARY KEY,
    lead_id     BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    vendor_id   BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    action      VARCHAR(20) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_actions_lead   ON lead_actions(lead_id);
CREATE INDEX idx_lead_actions_vendor ON lead_actions(vendor_id);


-- =============================================================
-- SECTION 14: BOOKINGS
-- Fix #14: Bookings table (was completely missing)
-- =============================================================

CREATE TABLE bookings (
    id              BIGSERIAL PRIMARY KEY,

    customer_id     BIGINT NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
    vendor_id       BIGINT NOT NULL REFERENCES vendor(id) ON DELETE RESTRICT,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    lead_id         BIGINT REFERENCES leads(id) ON DELETE SET NULL,

    event_date      DATE NOT NULL,
    booking_amount  NUMERIC(12,2) NOT NULL CHECK (booking_amount >= 0),
    currency        VARCHAR(10) DEFAULT 'INR',

    -- confirmed | completed | cancelled | refunded
    status          VARCHAR(20) NOT NULL DEFAULT 'confirmed',

    notes           TEXT,
    metadata        JSONB,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_vendor   ON bookings(vendor_id);
CREATE INDEX idx_bookings_service  ON bookings(service_id);
CREATE INDEX idx_bookings_date     ON bookings(event_date);

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 15: SUBSCRIPTIONS
-- Fix #15: Added FK constraints
-- =============================================================

CREATE TABLE subscriptions (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(50) NOT NULL,
    daily_unlock_limit  INTEGER NOT NULL DEFAULT 0,
    price               NUMERIC(10,2) NOT NULL DEFAULT 0,
    description         TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Fix #15: Added FK constraints (were missing)
CREATE TABLE vendor_subscriptions (
    id              BIGSERIAL PRIMARY KEY,

    -- Fix #15: FK constraints added
    vendor_id       BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,

    started_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,

    -- active | expired | cancelled
    status          VARCHAR(20) DEFAULT 'active',

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_subscriptions_vendor ON vendor_subscriptions(vendor_id);
CREATE INDEX idx_vendor_subscriptions_sub    ON vendor_subscriptions(subscription_id);

CREATE TRIGGER trg_vendor_subscriptions_updated_at
    BEFORE UPDATE ON vendor_subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Fix #16: Added UNIQUE constraint to prevent duplicate rows per vendor per day
CREATE TABLE unlock_usage (
    id          BIGSERIAL PRIMARY KEY,
    vendor_id   BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    usage_date  DATE NOT NULL,
    used_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    -- Fix #16: prevent duplicate tracking rows
    UNIQUE (vendor_id, usage_date)
);

CREATE INDEX idx_unlock_usage_vendor ON unlock_usage(vendor_id, usage_date);


-- =============================================================
-- SECTION 16: NOTIFICATIONS
-- Fix #17: type uses notification_type_enum
-- =============================================================

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,

    recipient_id    BIGINT NOT NULL,
    recipient_type  VARCHAR(20) NOT NULL
        CHECK (recipient_type IN ('customer', 'vendor', 'admin')),

    -- Fix #17: was VARCHAR(50)
    type            notification_type_enum NOT NULL,

    title           VARCHAR(255),
    message         TEXT,

    data            JSONB,

    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_unread    ON notifications(recipient_id, is_read) WHERE is_read = FALSE;


-- =============================================================
-- SECTION 17: VENDOR KYC
-- Fix #23: Vendor KYC table (was completely missing)
-- =============================================================

CREATE TABLE vendor_kyc (
    id                          BIGSERIAL PRIMARY KEY,
    vendor_id                   BIGINT UNIQUE NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,

    pan_number                  VARCHAR(20),
    gst_number                  VARCHAR(20),
    business_registration_number VARCHAR(50),
    aadhaar_last4               CHAR(4),

    -- pending | verified | rejected
    verification_status         vendor_verification_status NOT NULL DEFAULT 'pending',

    verified_at                 TIMESTAMPTZ,
    verified_by                 BIGINT REFERENCES admins(id),

    rejection_reason            TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_kyc_vendor ON vendor_kyc(vendor_id);

CREATE TRIGGER trg_vendor_kyc_updated_at
    BEFORE UPDATE ON vendor_kyc
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 18: VENDOR PAYOUTS
-- Fix #24: Payout system (was completely missing)
-- =============================================================

CREATE TABLE vendor_payouts (
    id          BIGSERIAL PRIMARY KEY,

    vendor_id   BIGINT NOT NULL REFERENCES vendor(id) ON DELETE RESTRICT,
    booking_id  BIGINT NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,

    amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency    VARCHAR(10) DEFAULT 'INR',

    -- pending | processing | paid | failed
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',

    paid_at     TIMESTAMPTZ,
    notes       TEXT,
    metadata    JSONB,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_payouts_vendor  ON vendor_payouts(vendor_id);
CREATE INDEX idx_vendor_payouts_booking ON vendor_payouts(booking_id);
CREATE INDEX idx_vendor_payouts_status  ON vendor_payouts(status);

CREATE TRIGGER trg_vendor_payouts_updated_at
    BEFORE UPDATE ON vendor_payouts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- SECTION 19: POSTGIS (uncomment after enabling extension)
-- Fix #18: Geospatial support
-- =============================================================

-- Run this first as a superuser if PostGIS is available:
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Then add the geography column to service_versions:
-- ALTER TABLE service_versions ADD COLUMN location GEOGRAPHY(Point, 4326);

-- Then populate from existing lat/lng data:
-- UPDATE service_versions
--     SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
-- WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Then create the GIST index:
-- CREATE INDEX idx_service_location ON service_versions USING GIST(location);

-- Example query — venues within 10km of a point:
-- SELECT sv.id, sv.service_name, ST_Distance(sv.location, ST_MakePoint(77.2090, 28.6139)::geography) AS dist_meters
-- FROM service_versions sv
-- JOIN services s ON s.id = sv.service_id
-- WHERE s.service_type = 'venue'
--   AND ST_DWithin(sv.location, ST_MakePoint(77.2090, 28.6139)::geography, 10000)
-- ORDER BY dist_meters;


-- =============================================================
-- END OF SCHEMA
-- =============================================================