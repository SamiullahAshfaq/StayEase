--liquibase formatted sql

--changeset stayease:0005-create-service-table
CREATE TABLE service (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    provider_public_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    service_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_provider FOREIGN KEY (provider_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE service;

--changeset stayease:0005-create-service-image-table
CREATE TABLE service_image (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_service_image_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
);
--rollback DROP TABLE service_image;

--changeset stayease:0005-create-service-booking-table
CREATE TABLE service_booking (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    service_id BIGINT NOT NULL,
    customer_public_id UUID NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_booking_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_booking_customer FOREIGN KEY (customer_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE service_booking;

--changeset stayease:0005-create-service-indexes
CREATE UNIQUE INDEX uk_service_public_id ON service(public_id);
CREATE UNIQUE INDEX uk_service_booking_public_id ON service_booking(public_id);
CREATE INDEX idx_service_provider ON service(provider_public_id);
CREATE INDEX idx_service_type ON service(service_type);
CREATE INDEX idx_service_booking_service ON service_booking(service_id);
CREATE INDEX idx_service_booking_customer ON service_booking(customer_public_id);
CREATE INDEX idx_service_booking_status ON service_booking(status);
--rollback DROP INDEX IF EXISTS uk_service_public_id, uk_service_booking_public_id, idx_service_provider, idx_service_type, idx_service_booking_service, idx_service_booking_customer, idx_service_booking_status;

--changeset stayease:0005-create-service-sequences
CREATE SEQUENCE service_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE service_image_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE service_booking_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS service_seq, service_image_seq, service_booking_seq;