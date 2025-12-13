-- V2__create_authority_tables.sql

-- Create authority table
CREATE TABLE authority (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Create user_authority table
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
CREATE INDEX idx_user_authority_user ON user_authority(user_id);
CREATE INDEX idx_user_authority_authority ON user_authority(authority_id);

-- Create sequences
CREATE SEQUENCE authority_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE user_authority_seq START WITH 1 INCREMENT BY 50;

-- Insert default authorities
INSERT INTO authority (id, name, description) VALUES 
    (nextval('authority_seq'), 'ROLE_USER', 'Default user role - basic access'),
    (nextval('authority_seq'), 'ROLE_TENANT', 'Tenant role - can book listings and services'),
    (nextval('authority_seq'), 'ROLE_LANDLORD', 'Landlord role - can create and manage listings'),
    (nextval('authority_seq'), 'ROLE_ADMIN', 'Administrator role - full system access'),
    (nextval('authority_seq'), 'ROLE_SERVICE_PROVIDER', 'Service provider role - can create and manage services');