-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Create priorities enum
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- Create priorities table
CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    name priority_level NOT NULL UNIQUE
);

-- Create ticket status enum
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    priority_id INTEGER REFERENCES priorities(id),
    status ticket_status NOT NULL DEFAULT 'Open',
    created_by UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ticket history table
CREATE TABLE ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Seed categories
INSERT INTO categories (name) VALUES
    ('IT Support'),
    ('HR'),
    ('Facilities'),
    ('Finance'),
    ('Security');

-- Seed priorities
INSERT INTO priorities (name) VALUES
    ('Low'),
    ('Medium'),
    ('High'),
    ('Critical');

-- Function to update ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating ticket updated_at
CREATE TRIGGER update_ticket_timestamp
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();

-- RLS Policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

-- Categories and Priorities are readable by all authenticated users
CREATE POLICY "Categories are readable by all users" ON categories
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Priorities are readable by all users" ON priorities
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Ticket policies
CREATE POLICY "Users can view their own tickets" ON tickets
    FOR SELECT
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'agent')
        )
    );

CREATE POLICY "Users can create tickets" ON tickets
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tickets" ON tickets
    FOR UPDATE
    USING (
        (auth.uid() = created_by)
        OR EXISTS (
            SELECT 1 FROM roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'agent')
        )
    );

CREATE POLICY "Only admins can delete tickets" ON tickets
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Comment policies
CREATE POLICY "Users can view comments on accessible tickets" ON comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = comments.ticket_id
            AND (
                tickets.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM roles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'agent')
                )
            )
        )
    );

CREATE POLICY "Users can comment on their tickets or if agent/admin" ON comments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_id
            AND (
                tickets.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM roles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'agent')
                )
            )
        )
    );

-- History policies
CREATE POLICY "Users can view history of accessible tickets" ON ticket_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_id
            AND (
                tickets.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM roles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'agent')
                )
            )
        )
    );