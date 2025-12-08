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
    CONSTRAINT fk_user_authority_authority FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE
);

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