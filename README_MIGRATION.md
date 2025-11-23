# Migration from Supabase to PostgreSQL

This project has been migrated from Supabase to a standalone PostgreSQL database with a Node.js/Express backend.

## Changes Made

### 1. Backend Server
- Created Express server in `/server` directory
- Implemented JWT-based authentication to replace Supabase Auth
- Created REST API endpoints for database operations
- Migrated all Supabase Edge Functions to Express routes:
  - `ai-assistant` → `/functions/v1/ai-assistant`
  - `generate-minutes` → `/functions/v1/generate-minutes`
  - `teams-notify` → `/functions/v1/teams-notify`
  - `send-notification-email` → `/functions/v1/send-notification-email` (Resend removed)
  - `health-check` → `/functions/v1/health-check`

### 2. Database
- Created PostgreSQL schema in `/database/init.sql`
- Migrated all Supabase migrations to PostgreSQL
- Replaced `auth.users` table with `users` table
- Removed Row Level Security (RLS) policies (handled in application layer)

### 3. Frontend
- Updated Supabase client adapter to use new backend API
- Maintained compatibility with existing hooks and components
- Updated AI assistant to use new backend endpoint

### 4. Removed Integrations
- **Resend**: Email sending functionality removed. Notifications are now only logged to the database.

## Setup Instructions

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Run Database Migrations

```bash
cd server
npm run migrate
```

### 4. Configure Environment Variables

Create `server/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grace_db
DB_USER=grace_user
DB_PASSWORD=grace_password

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3001
FRONTEND_URL=http://localhost:5173

LOVABLE_API_KEY=your-lovable-api-key
```

### 5. Start Backend Server

```bash
cd server
npm run dev
```

### 6. Update Frontend Environment

Create or update `.env` in the root:

```env
VITE_API_URL=http://localhost:3001
```

### 7. Start Frontend

```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/signin` - Sign in with email/password
- `POST /auth/signout` - Sign out
- `GET /auth/user` - Get current user

### Database Operations
- `GET /api/:table` - Query table
- `POST /api/:table` - Insert records
- `PATCH /api/:table` - Update records
- `DELETE /api/:table` - Delete records

### Functions
- `POST /functions/v1/ai-assistant` - AI chat assistant
- `POST /functions/v1/generate-minutes` - Generate meeting minutes
- `POST /functions/v1/teams-notify` - Send Teams notification
- `POST /functions/v1/send-notification-email` - Log email notification (no sending)
- `GET /functions/v1/health-check` - Health check

## Database Schema

The database schema matches the original Supabase schema with the following changes:
- `auth.users` → `users` (with `password_hash` instead of Supabase auth)
- Removed RLS policies (authentication handled in middleware)
- All other tables remain the same

## Authentication

Authentication now uses JWT tokens instead of Supabase sessions. The frontend client adapter maintains compatibility with the existing Supabase auth interface.

## Notes

- Email notifications are logged but not sent (Resend removed)
- All database queries go through the REST API
- The frontend client adapter maintains Supabase-like interface for compatibility
- Edge functions are now Express routes

