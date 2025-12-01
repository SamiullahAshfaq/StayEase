--liquibase formatted sql

--changeset stayease:0009-create-notification-table
CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_public_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    payload TEXT,
    [read] BIT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_public_id) REFERENCES [user](public_id) ON DELETE CASCADE
);
--rollback DROP TABLE notification;

--changeset stayease:0009-create-notification-indexes
CREATE INDEX idx_notification_user ON notification(user_public_id);
CREATE INDEX idx_notification_read ON notification([read]);
CREATE INDEX idx_notification_type ON notification(type);
--rollback DROP INDEX IF EXISTS idx_notification_user, idx_notification_read, idx_notification_type;

--changeset stayease:0009-create-notification-sequence
CREATE SEQUENCE notification_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS notification_seq;