-- Create categories table for both predefined and custom categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1', -- Hex color for UI
    icon VARCHAR(50) DEFAULT '📄', -- Emoji or icon identifier
    is_default BOOLEAN DEFAULT FALSE, -- True for system-provided categories
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL for default categories
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure category names are unique per user (or globally for defaults)
    UNIQUE(name, user_id)
);

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_default ON categories(is_default);
