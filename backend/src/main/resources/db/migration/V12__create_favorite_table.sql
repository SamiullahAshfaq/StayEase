-- Create favorite table for users to save their favorite listings
CREATE TABLE favorite
(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE,

    -- Unique constraint to prevent duplicate favorites
    CONSTRAINT uk_favorite_user_listing UNIQUE (user_id, listing_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_favorite_user_id ON favorite(user_id);
CREATE INDEX idx_favorite_listing_id ON favorite(listing_id);
CREATE INDEX idx_favorite_created_at ON favorite(created_at DESC);

-- Add comment
COMMENT ON TABLE favorite IS 'Stores user favorite listings (wishlist)';
COMMENT ON COLUMN favorite.user_id IS 'Reference to the user who favorited the listing';
COMMENT ON COLUMN favorite.listing_id IS 'Reference to the favorited listing';
COMMENT ON COLUMN favorite.created_at IS 'Timestamp when the listing was added to favorites';
