# ServiceNow Clone

A full-stack ticket management system similar to ServiceNow, built with modern web technologies.

## Tech Stack

- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **Backend**: Node.js with Express and TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Realtime)

## Project Structure

This is a monorepo containing:

- `/frontend` - React application
- `/backend` - Express API server

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- Supabase account

### Supabase Setup

1. Create a new Supabase project
2. Copy the SQL from `supabase/schema.sql` and run it in the Supabase SQL editor
3. Get your project URL and anon/service keys from the project settings

### Environment Setup

1. Backend setup:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Supabase credentials and JWT secret
   ```

2. Frontend setup:
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

### Installation

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

### Development

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or separately:

Backend:
```bash
cd backend && npm run dev
```

Frontend:
```bash
cd frontend && npm run dev
```

### Test Credentials

The following test accounts are available for testing:

| Email           | Password | Role      |
|----------------|----------|-----------|
| admin@test.com | test123  | Admin     |
| agent1@test.com| test123  | Agent     |
| agent2@test.com| test123  | Agent     |
| user1@test.com | test123  | Requester |
| user2@test.com | test123  | Requester |

Each account has different permissions:
- **Admin**: Can manage all tickets, users, and system settings
- **Agent**: Can view and handle tickets assigned to them
- **Requester**: Can create and view their own tickets

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Sign in existing user
- `GET /api/dashboard` - Protected route example (requires JWT)