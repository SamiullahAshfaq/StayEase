--liquibase formatted sql

--changeset stayease:0002-create-authority-table
CREATE TABLE authority (
    name VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255)
);
--rollback DROP TABLE authority;

--changeset stayease:0002-create-user-authority-table
CREATE TABLE user_authority (
    user_id BIGINT NOT NULL,
    authority_name VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, authority_name),
    CONSTRAINT fk_user_authority_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_authority_authority FOREIGN KEY (authority_name) REFERENCES authority(name) ON DELETE CASCADE
);
--rollback DROP TABLE user_authority;

--changeset stayease:0002-insert-default-authorities
INSERT INTO authority (name, description) VALUES 
    ('ROLE_TENANT', 'Tenant role - can book listings and services'),
    ('ROLE_LANDLORD', 'Landlord role - can create and manage listings'),
    ('ROLE_ADMIN', 'Administrator role - full system access'),
    ('ROLE_SERVICE_PROVIDER', 'Service provider role - can create and manage services');
--rollback DELETE FROM authority WHERE name IN ('ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN', 'ROLE_SERVICE_PROVIDER');