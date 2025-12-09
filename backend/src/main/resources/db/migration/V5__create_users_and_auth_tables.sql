-- Create users table
CREATE TABLE
IF NOT EXISTS users
(
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR
(255) NOT NULL UNIQUE,
    name VARCHAR
(255) NOT NULL,
    image_url VARCHAR
(500),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password VARCHAR
(255),
    provider VARCHAR
(50) NOT NULL,
    provider_id VARCHAR
(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_provider_provider_id UNIQUE
(provider, provider_id)
);

-- Create user_roles table
CREATE TABLE
IF NOT EXISTS user_roles
(
    user_id BIGINT NOT NULL,
    role VARCHAR
(50) NOT NULL,
    PRIMARY KEY
(user_id, role),
    CONSTRAINT fk_user_roles_user_id FOREIGN KEY
(user_id) REFERENCES users
(id) ON
DELETE CASCADE
);

-- Create user_activities table
CREATE TABLE
IF NOT EXISTS user_activities
(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type VARCHAR
(100) NOT NULL,
    description VARCHAR
(500),
    metadata TEXT,
    ip_address VARCHAR
(50),
    user_agent VARCHAR
(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_activities_user_id FOREIGN KEY
(user_id) REFERENCES users
(id) ON
DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
