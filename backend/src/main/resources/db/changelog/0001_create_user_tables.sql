--liquibase formatted sql

--changeset stayease:0001-create-user-table
CREATE TABLE "user" (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    password_hash VARCHAR(255),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--rollback DROP TABLE "user";

--changeset stayease:0001-create-user-indexes
CREATE UNIQUE INDEX uk_user_public_id ON "user"(public_id);
CREATE UNIQUE INDEX uk_user_email ON "user"(email);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_public_id ON "user"(public_id);
--rollback DROP INDEX IF EXISTS uk_user_public_id, uk_user_email, idx_user_email, idx_user_public_id;

--changeset stayease:0001-create-user-sequence
CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS user_seq;