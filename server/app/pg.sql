-- ========================================
-- USERS TABLE
-- Stores all user accounts (customers, vendors, admins)
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer','vendor','admin')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- SERVICES TABLE
-- A vendor can create services (venues, catering, DJs, etc.)
-- ========================================
CREATE TYPE service_type AS ENUM ('Wedding Venue', 'DJs', 'Event Management', 'Catering', 'Photography');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');




CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- vendor (owner of service)
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(12,2),
    type service_type NOT NULL,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    venue VARCHAR(150),
    capacity VARCHAR(50),
    amenities TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- IMAGES TABLE
-- Stores images for services (venues included)
-- ========================================
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    booking_date TIMESTAMP NOT NULL,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- APPOINTMENTS TABLE
-- Stores bookings between customers and vendors (via service)
-- ========================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- vendor = user.role='vendor'
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending','confirmed','cancelled','completed')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- PAYMENTS TABLE
-- Stores payment details for appointments
-- ========================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending','paid','failed','refunded')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('upi','card','cash')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- REVIEWS TABLE
-- Stores customer feedback on vendors & services
-- ========================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- AVAILABILITY TABLE
-- Stores available slots for services (vendor inferred from service.user_id)
-- ========================================
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    available_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, service_id, available_date, available_time)
);

-- ========================================
-- INDEXES (Performance Optimization)
-- ========================================
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_vendor ON appointments(vendor_id);
