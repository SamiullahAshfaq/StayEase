-- V11__add_indexes.sql

-- Additional performance indexes (basic ones already created in individual files)

-- Composite indexes for common queries
CREATE INDEX idx_booking_guest_status ON booking(guest_public_id, booking_status);
CREATE INDEX idx_booking_listing_dates ON booking(listing_public_id, check_in_date, check_out_date);
CREATE INDEX idx_listing_category_price ON listing(category, price_per_night);
CREATE INDEX idx_review_listing_rating ON review(target_listing_id, rating);
CREATE INDEX idx_message_conversation_created ON message(conversation_id, created_at DESC);
CREATE INDEX idx_notification_user_read ON notification(user_public_id, read);

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search indexes using PostgreSQL pg_trgm
CREATE INDEX idx_listing_title_trgm ON listing USING GIN (title gin_trgm_ops);
CREATE INDEX idx_listing_description_trgm ON listing USING GIN (description gin_trgm_ops);
CREATE INDEX idx_listing_location_trgm ON listing USING GIN (location gin_trgm_ops);
CREATE INDEX idx_service_title_trgm ON service USING GIN (title gin_trgm_ops);
CREATE INDEX idx_service_description_trgm ON service USING GIN (description gin_trgm_ops);