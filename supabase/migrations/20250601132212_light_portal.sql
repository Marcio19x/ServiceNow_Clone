-- Seed Users with hashed passwords (password is 'test123' for all users)
INSERT INTO users (id, email, password)
SELECT 
    uuid::uuid, email, password
FROM (
    VALUES 
        ('d7bed82c-5f89-4d49-9fde-10c35d304783', 'admin@test.com', '$2a$10$YaB6xpBcJe8Nc7rtUJCAFOO7KJoD1B3F4pHoG7XMxhX2b5HCDHzne'),
        ('b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', 'agent1@test.com', '$2a$10$YaB6xpBcJe8Nc7rtUJCAFOO7KJoD1B3F4pHoG7XMxhX2b5HCDHzne'),
        ('f1c5b83a-99c8-4d29-b89d-71a4d740f004', 'agent2@test.com', '$2a$10$YaB6xpBcJe8Nc7rtUJCAFOO7KJoD1B3F4pHoG7XMxhX2b5HCDHzne'),
        ('e4a79e67-d751-4c47-93c7-2c3c60c938d9', 'user1@test.com', '$2a$10$YaB6xpBcJe8Nc7rtUJCAFOO7KJoD1B3F4pHoG7XMxhX2b5HCDHzne'),
        ('a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'user2@test.com', '$2a$10$YaB6xpBcJe8Nc7rtUJCAFOO7KJoD1B3F4pHoG7XMxhX2b5HCDHzne')
    ) AS t(uuid, email, password)
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE id = t.uuid::uuid
);

-- Assign roles (only if user exists and doesn't have a role)
INSERT INTO roles (user_id, role)
SELECT 
    user_id::uuid, role::user_role
FROM (
    VALUES 
        ('d7bed82c-5f89-4d49-9fde-10c35d304783', 'admin'),
        ('b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', 'agent'),
        ('f1c5b83a-99c8-4d29-b89d-71a4d740f004', 'agent'),
        ('e4a79e67-d751-4c47-93c7-2c3c60c938d9', 'requester'),
        ('a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'requester')
    ) AS t(user_id, role)
WHERE EXISTS (
    SELECT 1 FROM users WHERE id = t.user_id::uuid
) AND NOT EXISTS (
    SELECT 1 FROM roles WHERE user_id = t.user_id::uuid
);

-- Create some tickets
INSERT INTO tickets (id, title, description, category_id, priority_id, status, created_by, assigned_to, created_at, updated_at)
SELECT 
    t.id::uuid, t.title, t.description, t.category_id, t.priority_id, t.status::ticket_status, 
    t.created_by::uuid, t.assigned_to::uuid, t.created_at, t.updated_at
FROM (
    VALUES 
        ('123e4567-e89b-12d3-a456-426614174000', 'Cannot access email', 'Getting error when trying to login to email client', 1, 2, 'Open', 'e4a79e67-d751-4c47-93c7-2c3c60c938d9', 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
        ('223e4567-e89b-12d3-a456-426614174001', 'New laptop request', 'Need a laptop for new employee starting next week', 1, 3, 'In Progress', 'a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'f1c5b83a-99c8-4d29-b89d-71a4d740f004', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
        ('323e4567-e89b-12d3-a456-426614174002', 'Printer not working', 'Office printer showing error code 501', 3, 1, 'Resolved', 'e4a79e67-d751-4c47-93c7-2c3c60c938d9', 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days')
    ) AS t(id, title, description, category_id, priority_id, status, created_by, assigned_to, created_at, updated_at)
WHERE NOT EXISTS (
    SELECT 1 FROM tickets WHERE id = t.id::uuid
);

-- Add comments to tickets
INSERT INTO comments (id, ticket_id, author_id, content, created_at)
SELECT 
    t.id::uuid, t.ticket_id::uuid, t.author_id::uuid, t.content, t.created_at
FROM (
    VALUES 
        ('423e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', 'Looking into this issue. Please provide your email client version.', NOW() - INTERVAL '1 day'),
        ('523e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'e4a79e67-d751-4c47-93c7-2c3c60c938d9', 'Using Outlook version 16.0.', NOW() - INTERVAL '12 hours'),
        ('623e4567-e89b-12d3-a456-426614174002', '223e4567-e89b-12d3-a456-426614174001', 'f1c5b83a-99c8-4d29-b89d-71a4d740f004', 'Laptop has been ordered. Expected delivery in 2 days.', NOW() - INTERVAL '1 day'),
        ('723e4567-e89b-12d3-a456-426614174003', '323e4567-e89b-12d3-a456-426614174002', 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', 'Printer has been fixed. Paper jam was causing the error.', NOW() - INTERVAL '2 days')
    ) AS t(id, ticket_id, author_id, content, created_at)
WHERE NOT EXISTS (
    SELECT 1 FROM comments WHERE id = t.id::uuid
);

-- Add ticket history
INSERT INTO ticket_history (ticket_id, changed_by, field_changed, old_value, new_value, changed_at)
SELECT 
    t.ticket_id::uuid, t.changed_by::uuid, t.field_changed, t.old_value, t.new_value, t.changed_at
FROM (
    VALUES 
        ('223e4567-e89b-12d3-a456-426614174001', 'f1c5b83a-99c8-4d29-b89d-71a4d740f004', 'status', 'Open', 'In Progress', NOW() - INTERVAL '1 day'),
        ('323e4567-e89b-12d3-a456-426614174002', 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', 'status', 'In Progress', 'Resolved', NOW() - INTERVAL '2 days'),
        ('323e4567-e89b-12d3-a456-426614174002', 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', 'assigned_to', NULL, 'b9c9c8d2-efb9-4a77-a9f3-c53c1e5f3c81', NOW() - INTERVAL '5 days')
    ) AS t(ticket_id, changed_by, field_changed, old_value, new_value, changed_at);