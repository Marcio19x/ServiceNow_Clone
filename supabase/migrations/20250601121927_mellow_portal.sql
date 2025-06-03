-- Add password column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '';

-- Update RLS policies for the password column
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add policy for updating password
CREATE POLICY "Users can update their own password" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);