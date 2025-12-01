--liquibase formatted sql

--changeset stayease:0010-create-admin-action-table
CREATE TABLE admin_action (
    id BIGSERIAL PRIMARY KEY,
    admin_public_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_action_admin FOREIGN KEY (admin_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE admin_action;

--changeset stayease:0010-create-audit-log-table
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_public_id UUID,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_actor FOREIGN KEY (actor_public_id) REFERENCES "user"(public_id) ON DELETE SET NULL
);
--rollback DROP TABLE audit_log;

--changeset stayease:0010-create-admin-indexes
CREATE INDEX idx_admin_action_admin ON admin_action(admin_public_id);
CREATE INDEX idx_admin_action_type ON admin_action(action_type);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_public_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
--rollback DROP INDEX IF EXISTS idx_admin_action_admin, idx_admin_action_type, idx_audit_log_actor, idx_audit_log_action, idx_audit_log_created_at;

--changeset stayease:0010-create-admin-sequences
CREATE SEQUENCE admin_action_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE audit_log_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS admin_action_seq, audit_log_seq;