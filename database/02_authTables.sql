-- NextAuth requires specific tables. Let's create them:

-- Accounts table (for OAuth providers like Google, GitHub)
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    id_token TEXT,
    scope TEXT,
    session_state TEXT,
    token_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(provider, "providerAccountId")
);

-- Sessions table (tracks user login sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification tokens (for email verification, password reset)
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,

    PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions("sessionToken");

-- Store password hashes separately (NextAuth doesn't handle passwords directly)

CREATE TABLE IF NOT EXISTS user_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);