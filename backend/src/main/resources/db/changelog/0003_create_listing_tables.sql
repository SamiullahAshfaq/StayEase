--liquibase formatted sql

--changeset stayease:0003-create-listing-table
CREATE TABLE listing (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    landlord_public_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    guests INT NOT NULL,
    bedrooms INT NOT NULL,
    beds INT NOT NULL,
    bathrooms INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_landlord FOREIGN KEY (landlord_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE listing;

--changeset stayease:0003-create-listing-image-table
CREATE TABLE listing_image (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_image_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE
);
--rollback DROP TABLE listing_image;

--changeset stayease:0003-create-listing-indexes
CREATE UNIQUE INDEX uk_listing_public_id ON listing(public_id);
CREATE INDEX idx_listing_landlord ON listing(landlord_public_id);
CREATE INDEX idx_listing_category ON listing(category);
CREATE INDEX idx_listing_location ON listing(location);
CREATE INDEX idx_listing_price ON listing(price);
CREATE INDEX idx_listing_image_listing ON listing_image(listing_id);
--rollback DROP INDEX IF EXISTS uk_listing_public_id, idx_listing_landlord, idx_listing_category, idx_listing_location, idx_listing_price, idx_listing_image_listing;

--changeset stayease:0003-create-listing-sequences
CREATE SEQUENCE listing_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE listing_image_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS listing_seq, listing_image_seq;