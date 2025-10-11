-- Enable extension for UUID generation (Postgres)
-- Either use pgcrypto or uuid-ossp depending on your DB
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- provides gen_random_uuid()

/* ---------------------------
   ENUM TYPES
   --------------------------- */
CREATE TYPE service_category_t AS ENUM ('venue','catering','dj','event_management','photographer');
CREATE TYPE pricing_type_t AS ENUM ('per_day','per_hour','per_head','package');
CREATE TYPE hall_type_t AS ENUM ('banquet','lawn','farmhouse','resort');
CREATE TYPE indoor_outdoor_t AS ENUM ('indoor','outdoor','both');
CREATE TYPE decoration_policy_t AS ENUM ('allowed','in-house-only');
CREATE TYPE catering_policy_t AS ENUM ('allowed','in-house-only');
CREATE TYPE alcohol_policy_t AS ENUM ('allowed','not-allowed');
CREATE TYPE service_style_t AS ENUM ('buffet','plated','live_counter');
CREATE TYPE slot_t AS ENUM ('morning','afternoon','evening','night');
CREATE TYPE availability_reason_t AS ENUM ('booking','vendor_block','system_block');
CREATE TYPE booking_status_t AS ENUM ('pending','confirmed','canceled','completed');
CREATE TYPE booking_source_t AS ENUM ('online','offline');
CREATE TYPE payment_status_t AS ENUM ('pending','paid','refunded');
CREATE TYPE payment_provider_status_t AS ENUM ('requires_action','pending','succeeded','failed','refunded');
CREATE TYPE package_modal_t AS ENUM ('package_based','hourly','fixed'); -- normalized values

/* ---------------------------
   USERS, ROLES
   --------------------------- */
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE TABLE roles (
    id SMALLSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

/* ---------------------------
   VENDORS (profile for user who is a vendor)
   - NOTE: authentication remains in users table (hashed_password)
   - vendor.user_id links to the account (allows same email to be both vendor & customer)
   --------------------------- */
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    contact_person TEXT NOT NULL,
    phone TEXT UNIQUE,
    city TEXT,
    state TEXT,
    country TEXT,
    pincode TEXT,
    experience_years INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (business_name, city)
);

CREATE INDEX idx_vendors_city_state ON vendors(city, state);
CREATE INDEX idx_vendors_is_verified ON vendors(is_verified);


/* ---------------------------
   SERVICES (common)
   --------------------------- */
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category servicecategory NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    base_price NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    pricing_type pricingtype NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    address_line1 TEXT,
    address_line2 TEXT,
    area VARCHAR(150),
    city VARCHAR(150),
    state VARCHAR(150),
    country VARCHAR(150),
    pincode VARCHAR(20),
    geo_point JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_vendor_service UNIQUE (vendor_id, category, title, city, pincode)
);


-- Multi-column index for fast filtering
CREATE INDEX idx_service_filtering
ON services (city, category, base_price, is_active, verified, featured);

-- GIN index for JSONB 'tags' search
CREATE INDEX idx_services_tags_gin
ON services USING GIN (tags jsonb_path_ops);

-- Indexes for location and activity filters
CREATE INDEX idx_services_city ON services (city);
CREATE INDEX idx_services_state ON services (state);
CREATE INDEX idx_services_country ON services (country);
CREATE INDEX idx_services_pincode ON services (pincode);



-- ✅ Indexes for Fast Filtering
CREATE INDEX idx_service_filtering ON services(city, category, base_price, is_active, verified, featured);
CREATE INDEX idx_service_price ON services(base_price);
CREATE INDEX idx_service_category ON services(category);
CREATE INDEX idx_service_city_state ON services(city, state);
CREATE INDEX idx_services_jsonb_images ON services USING gin (images jsonb_path_ops);
CREATE INDEX idx_services_jsonb_amenities ON services USING gin (amenities jsonb_path_ops);



CREATE TABLE service_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    images JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_service_variants_service_price ON service_variants(service_id, price);
CREATE INDEX idx_service_variants_active ON service_variants(is_active);
CREATE INDEX idx_variants_images ON service_variants USING gin (images jsonb_path_ops);
CREATE INDEX idx_variants_amenities ON service_variants USING gin (amenities jsonb_path_ops);

/* ---------------------------
   VENUE SERVICE (structured details)
   --------------------------- */
CREATE TABLE venue_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  capacity_min INTEGER CHECK (capacity_min >= 0),
  capacity_max INTEGER CHECK (capacity_max >= 0),
  hall_type hall_type_t,
  amenities JSONB DEFAULT '[]'::jsonb,  -- list of strings
  indoor_outdoor indoor_outdoor_t,
  square_feet NUMERIC(10,2) CHECK (square_feet >= 0),
  parking_capacity INTEGER CHECK (parking_capacity >= 0),
  decoration_policy decoration_policy_t,
  catering_policy catering_policy_t,
  alcohol_policy alcohol_policy_t
);

/* ---------------------------
   CATERING SERVICE
   --------------------------- */
CREATE TABLE catering_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  cuisine_types JSONB DEFAULT '[]'::jsonb, -- list of cuisines
  veg_price_per_head NUMERIC(12,2) CHECK (veg_price_per_head >= 0),
  nonveg_price_per_head NUMERIC(12,2) CHECK (nonveg_price_per_head >= 0),
  min_order INTEGER CHECK (min_order >= 0),
  max_order INTEGER CHECK (max_order >= 0),
  service_style service_style_t,
  staff_included BOOLEAN DEFAULT TRUE,
  crockery_cutlery_included BOOLEAN DEFAULT TRUE,
  tasting_available BOOLEAN DEFAULT FALSE
);

/* ---------------------------
   DJ SERVICE
   --------------------------- */
CREATE TABLE dj_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  genres_supported JSONB DEFAULT '[]'::jsonb, -- array of genres
  duration_hours NUMERIC(5,2) CHECK (duration_hours >= 0),
  equipment JSONB DEFAULT '[]'::jsonb,
  lighting_included BOOLEAN DEFAULT FALSE,
  mc_host_available BOOLEAN DEFAULT FALSE,
  setup_time_required NUMERIC(5,2) DEFAULT 1.0  -- hours
);

/* ---------------------------
   PHOTOGRAPHER SERVICE
   --------------------------- */
CREATE TABLE photographer_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  package_type JSONB DEFAULT '[]'::jsonb,    -- allows multiple package descriptors or structured data
  hours_covered NUMERIC(6,2) CHECK (hours_covered >= 0),
  photos_delivered INTEGER CHECK (photos_delivered >= 0),
  edited_photos_count INTEGER CHECK (edited_photos_count >= 0),
  delivery_time_days INTEGER CHECK (delivery_time_days >= 0),
  videography_included BOOLEAN DEFAULT FALSE,
  drone_available BOOLEAN DEFAULT FALSE,
  album_included BOOLEAN DEFAULT FALSE
);

/* ---------------------------
   EVENT MANAGEMENT SERVICE
   --------------------------- */
CREATE TABLE event_management_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  event_types JSONB DEFAULT '[]'::jsonb,
  team_size INTEGER CHECK (team_size >= 0),
  includes JSONB DEFAULT '[]'::jsonb,  -- planning, decoration, logistics, entertainment, etc
  package_modal package_modal_t,
  vendor_network_size INTEGER CHECK (vendor_network_size >= 0),
  experience_years INTEGER CHECK (experience_years >= 0)
);

/* ---------------------------
   SERVICE EXTRA (fallback for any additional data)
   --------------------------- */
CREATE TABLE service_extra (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  extra_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ---------------------------
   BOOKINGS
   --------------------------- */
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,        -- booking customer
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,    -- vendor for quick joins
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  event_date TIMESTAMPTZ NOT NULL,
  currency TEXT DEFAULT 'INR',
  slot slot_t DEFAULT 'evening',
  guest_count INTEGER CHECK (guest_count >= 0),
  status booking_status_t NOT NULL DEFAULT 'pending',
  source booking_source_t NOT NULL DEFAULT 'online',
  amount_total NUMERIC(12,2) CHECK (amount_total >= 0) DEFAULT 0,
  amount_paid NUMERIC(12,2) CHECK (amount_paid >= 0) DEFAULT 0,
  payment_status payment_status_t NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_booking_per_slot UNIQUE (service_id, event_date, slot)  -- prevents double-booking same slot & date
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);

/* ---------------------------
   PAYMENTS
   --------------------------- */
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'INR',
  provider TEXT,                -- stripe / razorpay / paytm etc
  provider_reference TEXT,      -- payment gateway's reference id
  provider_status payment_provider_status_t,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);

/* ---------------------------
   SERVICE RATING (denormalized summary)
   --------------------------- */
CREATE TABLE service_rating_summary (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  average_rating NUMERIC(3,2) CHECK (average_rating >= 0 AND average_rating <= 5) DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0
);

/* ---------------------------
   REVIEWS (each review tied to a booking)
   --------------------------- */
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,  -- keep historical reviews even if booking removed
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

/* ---------------------------
   AVAILABILITY BLOCK (exceptions model)
   - store only blocked/booked slots
   --------------------------- */
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,              -- date part only; slot covers time window
  slot slot_t NOT NULL,
  reason availability_reason_t NOT NULL,
  reference_id UUID,               -- optional: points to booking_id for reason='booking'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_service_date_slot UNIQUE (service_id, date, slot)
);

CREATE INDEX idx_avail_service_date ON availability_blocks(service_id, date);
CREATE INDEX idx_avail_date ON availability_blocks(date);

/* ---------------------------
   Useful triggers / notes (implement in app or DB)
   - Update 'updated_at' columns via trigger OR app
   - Keep service_rating_summary updated via application logic or DB triggers on reviews insert/update/delete
   --------------------------- */

-- create enums (if not already created)
CREATE TYPE enquiry_channel_t AS ENUM ('website','email','phone','whatsapp');
CREATE TYPE enquiry_status_t AS ENUM ('pending','contacted','converted','closed','spam');

-- Create enquiries table (UUID PK, links to bookings.id which is UUID)
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(150),
  email TEXT,
  phone TEXT,
  preferred_date DATE,
  guest_count INTEGER CHECK (guest_count >= 0),
  message TEXT,
  channel enquiry_channel_t NOT NULL DEFAULT 'website',
  status enquiry_status_t NOT NULL DEFAULT 'pending',
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,  -- <--- correct reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_service ON enquiries(service_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_vendor ON enquiries(vendor_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_channel ON enquiries(channel);


-- Faster lookups inside JSON fields
CREATE INDEX IF NOT EXISTS idx_services_amenities_gin ON services USING gin (amenities);
CREATE INDEX IF NOT EXISTS idx_variants_amenities_gin ON service_variants USING gin (amenities);

-- Performance tuning
ALTER TABLE services SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE reviews SET (autovacuum_vacuum_scale_factor = 0.1);

