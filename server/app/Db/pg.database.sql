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

    catering_options        JSONB NOT NULL,
    amenities               JSONB,
    venue_rules             JSONB,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_type ON venues(venue_type);
CREATE INDEX idx_venue_capacity ON venues(max_capacity);

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

CREATE TABLE wishlist_items (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, service_id)
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);

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