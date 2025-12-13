-- V1__create_user_tables.sql

-- Create user table
CREATE TABLE "user" (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(500),
    bio TEXT,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_account_id VARCHAR(255),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user sequence
CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 50;

-- Create indexes
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_public_id ON "user"(public_id);
CREATE INDEX idx_user_oauth_provider ON "user"(oauth_provider, oauth_provider_id);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_timestamp
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_timestamp();