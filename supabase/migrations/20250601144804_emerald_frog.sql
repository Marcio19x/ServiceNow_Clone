-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'requester');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS roles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'requester'
);

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_user_created ON users;
DROP FUNCTION IF EXISTS create_user_role();

-- Recreate function and trigger
CREATE OR REPLACE FUNCTION create_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO roles (user_id, role)
    VALUES (NEW.id, 'requester');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_role();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own role" ON roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON roles;

-- Recreate policies
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM roles
        WHERE user_id = auth.uid()
        AND role = 'admin'::user_role
    ));

CREATE POLICY "Users can read own role" ON roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON roles
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM roles
        WHERE user_id = auth.uid()
        AND role = 'admin'::user_role
    ));