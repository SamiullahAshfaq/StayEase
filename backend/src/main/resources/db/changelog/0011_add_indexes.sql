--liquibase formatted sql

--changeset stayease:0011-add-performance-indexes
-- Additional performance indexes (basic ones already created in individual files)

-- Composite indexes for common queries
CREATE INDEX idx_booking_tenant_status ON booking(tenant_public_id, status);
CREATE INDEX idx_booking_listing_dates ON booking(listing_id, start_date, end_date);
CREATE INDEX idx_listing_category_price ON listing(category, price);
CREATE INDEX idx_review_listing_rating ON review(target_listing_id, rating);
CREATE INDEX idx_message_conversation_created ON message(conversation_id, created_at DESC);
CREATE INDEX idx_notification_user_read ON notification(user_public_id, [read]);

-- Full-text search indexes for text fields (SQL Server does not support pg_trgm or gin indexes)
-- Consider using full-text indexes in SQL Server:
CREATE FULLTEXT INDEX ON listing(title) KEY INDEX PK_listing;
CREATE FULLTEXT INDEX ON listing(description) KEY INDEX PK_listing;
CREATE FULLTEXT INDEX ON listing(location) KEY INDEX PK_listing;

-- No equivalent for CREATE EXTENSION in SQL Server; remove or replace as needed.

--rollback DROP INDEX IF EXISTS idx_booking_tenant_status, idx_booking_listing_dates, idx_listing_category_price, idx_review_listing_rating, idx_message_conversation_created, idx_notification_user_read, idx_listing_title_trgm, idx_listing_description_trgm, idx_listing_location_trgm;
--rollback DROP EXTENSION IF EXISTS pg_trgm;