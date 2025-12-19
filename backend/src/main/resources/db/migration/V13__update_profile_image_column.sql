-- V13: Update profile_image_url column to support base64 images
-- Migration to change profile_image_url from VARCHAR(500) to TEXT

ALTER TABLE "user" ALTER COLUMN profile_image_url TYPE
TEXT USING profile_image_url::TEXT;

-- Add comment explaining the column stores base64 image data
COMMENT ON COLUMN "user".profile_image_url IS 'Stores either a URL or base64-encoded image data';
