-- V4__create_booking_tables.sql

CREATE TABLE booking (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    listing_public_id UUID NOT NULL,
    guest_public_id UUID NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INT NOT NULL,
    number_of_nights INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_listing FOREIGN KEY (listing_public_id) REFERENCES listing(public_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_guest FOREIGN KEY (guest_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

CREATE TABLE booking_addon (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_booking_addon_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_booking_public_id ON booking(public_id);
CREATE INDEX idx_booking_listing ON booking(listing_public_id);
CREATE INDEX idx_booking_guest ON booking(guest_public_id);
CREATE INDEX idx_booking_status ON booking(booking_status);
CREATE INDEX idx_booking_payment_status ON booking(payment_status);
CREATE INDEX idx_booking_check_in ON booking(check_in_date);
CREATE INDEX idx_booking_check_out ON booking(check_out_date);
CREATE INDEX idx_booking_dates ON booking(listing_public_id, check_in_date, check_out_date);
CREATE INDEX idx_booking_addon_booking ON booking_addon(booking_id);

-- Create sequences
CREATE SEQUENCE booking_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE booking_addon_seq START WITH 1 INCREMENT BY 50;

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_booking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_timestamp
    BEFORE UPDATE ON booking
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_timestamp();