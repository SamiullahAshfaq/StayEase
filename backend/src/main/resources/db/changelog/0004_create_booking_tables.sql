--liquibase formatted sql

--changeset stayease:0004-create-booking-table
CREATE TABLE booking (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    listing_id BIGINT,
    tenant_public_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nb_of_travelers INT NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_tenant FOREIGN KEY (tenant_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE booking;

--changeset stayease:0004-create-booking-addon-table
CREATE TABLE booking_addon (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_booking_addon_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE
);
--rollback DROP TABLE booking_addon;

--changeset stayease:0004-create-booking-indexes
CREATE UNIQUE INDEX uk_booking_public_id ON booking(public_id);
CREATE INDEX idx_booking_listing ON booking(listing_id);
CREATE INDEX idx_booking_tenant ON booking(tenant_public_id);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_dates ON booking(start_date, end_date);
CREATE INDEX idx_booking_addon_booking ON booking_addon(booking_id);
--rollback DROP INDEX IF EXISTS uk_booking_public_id, idx_booking_listing, idx_booking_tenant, idx_booking_status, idx_booking_dates, idx_booking_addon_booking;

--changeset stayease:0004-create-booking-sequences
CREATE SEQUENCE booking_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE booking_addon_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS booking_seq, booking_addon_seq;