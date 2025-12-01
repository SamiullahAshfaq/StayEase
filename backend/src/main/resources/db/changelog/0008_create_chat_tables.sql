--liquibase formatted sql

--changeset stayease:0008-create-conversation-table
CREATE TABLE conversation (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    subject VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--rollback DROP TABLE conversation;

--changeset stayease:0008-create-conversation-participant-table
CREATE TABLE conversation_participant (
    conversation_id BIGINT NOT NULL,
    user_public_id UUID NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    PRIMARY KEY (conversation_id, user_public_id),
    CONSTRAINT fk_conversation_participant_conversation FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation_participant_user FOREIGN KEY (user_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE conversation_participant;

--changeset stayease:0008-create-message-table
CREATE TABLE message (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_public_id UUID NOT NULL,
    body TEXT NOT NULL,
    attachments VARCHAR(2000),
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE message;

--changeset stayease:0008-create-chat-indexes
CREATE UNIQUE INDEX uk_conversation_public_id ON conversation(public_id);
CREATE INDEX idx_conversation_participant_user ON conversation_participant(user_public_id);
CREATE INDEX idx_message_conversation ON message(conversation_id);
CREATE INDEX idx_message_sender ON message(sender_public_id);
CREATE INDEX idx_message_created_at ON message(created_at);
--rollback DROP INDEX IF EXISTS uk_conversation_public_id, idx_conversation_participant_user, idx_message_conversation, idx_message_sender, idx_message_created_at;

--changeset stayease:0008-create-chat-sequences
CREATE SEQUENCE conversation_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE message_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS conversation_seq, message_seq;