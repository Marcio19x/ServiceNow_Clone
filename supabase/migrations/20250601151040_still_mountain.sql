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
    password TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS roles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'requester'
);

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_user_created ON users;
DROP FUNCTION IF EXISTS create_user_role();
DROP FUNCTION IF EXISTS is_admin();

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM roles
        WHERE roles.user_id = $1
        AND roles.role = 'admin'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert data" ON users;
DROP POLICY IF EXISTS "Users can read own role" ON roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON roles;
DROP POLICY IF EXISTS "Users can insert roles" ON roles;

-- Create policies using security definer function
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert data" ON users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can read own role" ON roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON roles
    FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert roles" ON roles
    FOR INSERT
    WITH CHECK (true);