-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create roles enum
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'requester');

-- Create roles table
CREATE TABLE roles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'requester'
);

-- Function to create role for new user
CREATE OR REPLACE FUNCTION create_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO roles (user_id, role)
    VALUES (NEW.id, 'requester');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create role on user creation
CREATE TRIGGER on_user_created
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_role();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Roles policies
CREATE POLICY "Users can read own role" ON roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );