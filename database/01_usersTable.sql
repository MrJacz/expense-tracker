-- Create the users table with email verification support
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster email lookups (important for login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Note: Email verification is handled by NextAuth verification_tokens table
