-- V5__create_service_offering_tables.sql

-- Create service table
CREATE TABLE service (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    provider_public_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    service_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_provider FOREIGN KEY (provider_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);

-- Create service_image table
CREATE TABLE service_image (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_service_image_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
);

-- Create service_booking table
CREATE TABLE service_booking (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    service_id BIGINT NOT NULL,
    customer_public_id UUID NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_booking_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_booking_customer FOREIGN KEY (customer_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);

-- Create service indexes
CREATE INDEX idx_service_public_id ON service(public_id);
CREATE INDEX idx_service_provider ON service(provider_public_id);
CREATE INDEX idx_service_type ON service(service_type);
CREATE INDEX idx_service_image_service ON service_image(service_id);
CREATE INDEX idx_service_booking_public_id ON service_booking(public_id);
CREATE INDEX idx_service_booking_service ON service_booking(service_id);
CREATE INDEX idx_service_booking_customer ON service_booking(customer_public_id);
CREATE INDEX idx_service_booking_status ON service_booking(status);

-- Create service sequences
CREATE SEQUENCE service_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE service_image_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE service_booking_seq START WITH 1 INCREMENT BY 50;

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_service_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_timestamp
    BEFORE UPDATE ON service
    FOR EACH ROW
    EXECUTE FUNCTION update_service_timestamp();