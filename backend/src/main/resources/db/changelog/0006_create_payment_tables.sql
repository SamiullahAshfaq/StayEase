--liquibase formatted sql

--changeset stayease:0006-create-payment-table
CREATE TABLE payment (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    related_booking_id BIGINT,
    related_service_booking_id BIGINT,
    payer_public_id UUID NOT NULL,
    payee_public_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking FOREIGN KEY (related_booking_id) REFERENCES booking(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_service_booking FOREIGN KEY (related_service_booking_id) REFERENCES service_booking(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_payer FOREIGN KEY (payer_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_payee FOREIGN KEY (payee_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE payment;

--changeset stayease:0006-create-payout-table
CREATE TABLE payout (
    id BIGSERIAL PRIMARY KEY,
    host_public_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payout_host FOREIGN KEY (host_public_id) REFERENCES "user"(public_id) ON DELETE CASCADE
);
--rollback DROP TABLE payout;

--changeset stayease:0006-create-payment-indexes
CREATE UNIQUE INDEX uk_payment_public_id ON payment(public_id);
CREATE INDEX idx_payment_payer ON payment(payer_public_id);
CREATE INDEX idx_payment_payee ON payment(payee_public_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_booking ON payment(related_booking_id);
CREATE INDEX idx_payout_host ON payout(host_public_id);
--rollback DROP INDEX IF EXISTS uk_payment_public_id, idx_payment_payer, idx_payment_payee, idx_payment_status, idx_payment_booking, idx_payout_host;

--changeset stayease:0006-create-payment-sequences
CREATE SEQUENCE payment_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE payout_seq START WITH 1 INCREMENT BY 50;
--rollback DROP SEQUENCE IF EXISTS payment_seq, payout_seq;