-- Create admin_action table
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

-- Create audit_log table
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_public_id UUID,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_actor FOREIGN KEY (actor_public_id) REFERENCES "user"(public_id) ON DELETE SET NULL
);

-- Create admin indexes
CREATE INDEX idx_admin_action_admin ON admin_action(admin_public_id);
CREATE INDEX idx_admin_action_type ON admin_action(action_type);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_public_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Create admin sequences
CREATE SEQUENCE admin_action_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE audit_log_seq START WITH 1 INCREMENT BY 50;