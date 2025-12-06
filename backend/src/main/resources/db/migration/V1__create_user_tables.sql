-- V1__create_user_tables.sql

-- Create user table
CREATE TABLE "user" (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(1000),
    date_of_birth DATE,
    bio TEXT,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'USD',
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create authority table
CREATE TABLE authority (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Create user_authority junction table
CREATE TABLE user_authority (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    authority_id BIGINT NOT NULL,
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_authority_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_authority_authority FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_authority UNIQUE (user_id, authority_id)
);

-- Create indexes
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_public_id ON "user"(public_id);
CREATE INDEX idx_user_account_status ON "user"(account_status);
CREATE INDEX idx_user_authority_user ON user_authority(user_id);
CREATE INDEX idx_user_authority_authority ON user_authority(authority_id);

-- Create sequences
CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE authority_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE user_authority_seq START WITH 1 INCREMENT BY 50;

-- Insert default authorities
INSERT INTO authority (id, name, description) VALUES 
(1, 'ROLE_USER', 'Regular user with basic permissions'),
(2, 'ROLE_LANDLORD', 'User who can create and manage listings'),
(3, 'ROLE_ADMIN', 'Administrator with full system access');

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