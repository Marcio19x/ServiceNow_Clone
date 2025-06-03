-- Update existing test users if they exist, otherwise insert new ones
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
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    password = EXCLUDED.password;

-- Update roles for existing users, insert for new ones
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
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role;