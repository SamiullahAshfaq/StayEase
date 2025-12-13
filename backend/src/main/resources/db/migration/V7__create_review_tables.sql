-- V7__create_review_tables.sql

-- Create review table
CREATE TABLE review (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    author_public_id UUID NOT NULL,
    target_listing_id BIGINT,
    target_service_id BIGINT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_author FOREIGN KEY (author_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_listing FOREIGN KEY (target_listing_id) REFERENCES listing(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_service FOREIGN KEY (target_service_id) REFERENCES service(id) ON DELETE CASCADE,
    CONSTRAINT chk_review_target CHECK (
        (target_listing_id IS NOT NULL AND target_service_id IS NULL) OR 
        (target_listing_id IS NULL AND target_service_id IS NOT NULL)
    )
);

-- Create review indexes
CREATE INDEX idx_review_public_id ON review(public_id);
CREATE INDEX idx_review_author ON review(author_public_id);
CREATE INDEX idx_review_listing ON review(target_listing_id);
CREATE INDEX idx_review_service ON review(target_service_id);
CREATE INDEX idx_review_rating ON review(rating);

-- Create review sequence
CREATE SEQUENCE review_seq START WITH 1 INCREMENT BY 50;

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_timestamp
    BEFORE UPDATE ON review
    FOR EACH ROW
    EXECUTE FUNCTION update_review_timestamp();