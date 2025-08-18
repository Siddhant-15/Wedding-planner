-- 1. ENUM types
CREATE TYPE userrole AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE servicetype AS ENUM ('catering', 'dj', 'photography', 'decor', 'makeup', 'other');
CREATE TYPE paymentstatus AS ENUM ('requires_action', 'pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE bookingstatus AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE appointmentstatus AS ENUM ('requested', 'confirmed', 'cancelled', 'completed');

-- 2. USERS table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    role userrole DEFAULT 'customer' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_email_idx UNIQUE (email)
);

-- 3. VENDORS table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    description TEXT,
    address_line1 VARCHAR(120),
    address_line2 VARCHAR(120),
    city VARCHAR(60),
    state VARCHAR(60),
    pincode VARCHAR(10),
    country VARCHAR(56) DEFAULT 'India',
    phone VARCHAR(20),
    website VARCHAR(255)
);

-- 4. VENUES table
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address_line1 VARCHAR(120) NOT NULL,
    address_line2 VARCHAR(120),
    city VARCHAR(60) NOT NULL,
    state VARCHAR(60) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(56) DEFAULT 'India' NOT NULL,
    capacity_min INT DEFAULT 50,
    capacity_max INT DEFAULT 500,
    price_per_day NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    amenities JSONB,
    images JSONB
);

-- 5. SERVICES table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type servicetype NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    unit VARCHAR(20) DEFAULT 'day',
    images JSONB
);

-- 6. REVIEWS table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    venue_id INT REFERENCES venues(id),
    service_id INT REFERENCES services(id),
    rating INT NOT NULL,
    title TEXT,
    body TEXT
);

-- 7. BOOKINGS table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    venue_id INT REFERENCES venues(id),
    service_id INT REFERENCES services(id),
    event_date DATE NOT NULL,
    guests INT,
    status bookingstatus DEFAULT 'pending' NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR' NOT NULL,
    notes VARCHAR(2000)
);

-- 8. PAYMENTS table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES bookings(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR' NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_reference VARCHAR(100),
    status paymentstatus DEFAULT 'pending' NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AVAILABILITIES table
CREATE TABLE availabilities (
    id SERIAL PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT uq_venue_date UNIQUE (venue_id, date)
);

-- 10. APPOINTMENTS table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    vendor_id INT NOT NULL REFERENCES vendors(id),
    venue_id INT REFERENCES venues(id),
    preferred_date DATE NOT NULL,
    status appointmentstatus DEFAULT 'requested' NOT NULL,
    message VARCHAR(1000)
);

-- Indexes (matching your SQLAlchemy indexes)
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_venues_name ON venues(name);
CREATE INDEX idx_venues_city ON venues(city);
