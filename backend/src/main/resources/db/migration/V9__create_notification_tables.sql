-- Create notification table
CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_public_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    payload TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);

-- Create notification indexes
CREATE INDEX idx_notification_user ON notification(user_public_id);
CREATE INDEX idx_notification_read ON notification(read);
CREATE INDEX idx_notification_type ON notification(type);

-- Create notification sequence
CREATE SEQUENCE notification_seq START WITH 1 INCREMENT BY 50;