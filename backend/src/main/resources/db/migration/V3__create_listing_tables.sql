-- V3__create_listing_tables.sql

CREATE TABLE listing (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    landlord_public_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    price_per_night DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    max_guests INT NOT NULL,
    bedrooms INT NOT NULL,
    beds INT NOT NULL,
    bathrooms DECIMAL(3,1) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amenities JSONB,
    house_rules TEXT,
    cancellation_policy VARCHAR(50) DEFAULT 'FLEXIBLE',
    minimum_stay INT DEFAULT 1,
    maximum_stay INT,
    instant_book BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_landlord FOREIGN KEY (landlord_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);

CREATE TABLE listing_image (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    caption VARCHAR(255),
    is_cover BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_image_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_listing_public_id ON listing(public_id);
CREATE INDEX idx_listing_landlord ON listing(landlord_public_id);
CREATE INDEX idx_listing_category ON listing(category);
CREATE INDEX idx_listing_location ON listing(location);
CREATE INDEX idx_listing_city ON listing(city);
CREATE INDEX idx_listing_country ON listing(country);
CREATE INDEX idx_listing_price ON listing(price_per_night);
CREATE INDEX idx_listing_status ON listing(status);
CREATE INDEX idx_listing_property_type ON listing(property_type);
CREATE INDEX idx_listing_amenities ON listing USING GIN (amenities);
CREATE INDEX idx_listing_image_listing ON listing_image(listing_id);
CREATE INDEX idx_listing_image_cover ON listing_image(listing_id, is_cover) WHERE is_cover = true;

-- Create sequences
CREATE SEQUENCE listing_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE listing_image_seq START WITH 1 INCREMENT BY 50;

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_timestamp
    BEFORE UPDATE ON listing
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_timestamp();