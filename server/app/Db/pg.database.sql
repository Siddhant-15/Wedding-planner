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

CREATE INDEX idx_customer_email ON customer (email);

-- Vendor table
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

CREATE INDEX idx_vendor_email         ON vendor (email);
CREATE INDEX idx_vendor_business_name ON vendor (business_name);