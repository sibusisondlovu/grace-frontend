# End-to-End Setup Guide

This guide will help you set up and verify the complete system functionality.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v15 or higher) - either via Docker or local installation
3. **npm** or **yarn**

## Step 1: Database Setup

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker compose up -d

# Verify it's running
docker compose ps
```

### Option B: Local PostgreSQL

```bash
# Create database
createdb grace_db

# Run initialization script
psql grace_db < database/init.sql
```

## Step 2: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grace_db
DB_USER=grace_user
DB_PASSWORD=grace_password

JWT_SECRET=your-secret-key-change-in-production-$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

PORT=3001
FRONTEND_URL=http://localhost:5173

LOVABLE_API_KEY=your-lovable-api-key
EOF

# Run database migrations
npm run migrate

# Start the server (in development mode)
npm run dev
```

The backend should now be running on `http://localhost:3001`

## Step 3: Frontend Setup

```bash
# From project root
cd ..

# Install dependencies (if not already done)
npm install

# Create environment file
cat > .env << EOF
VITE_API_URL=http://localhost:3001
EOF

# Start development server
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## Step 4: Verify System Functionality

### 4.1 Test Backend Health

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}

curl http://localhost:3001/functions/v1/health-check
# Should return health status with database check
```

### 4.2 Test Authentication

```bash
# Sign in (you'll need to create a user first via database)
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4.3 Test Database Queries

```bash
# Get committees (requires authentication token)
curl http://localhost:3001/api/committees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.4 Test Frontend

1. Open `http://localhost:5173` in your browser
2. Try to sign in (create a test user first)
3. Navigate through the application
4. Check browser console for any errors

## Step 5: Create Initial User

Since authentication is now handled locally, you need to create a user in the database:

```sql
-- Connect to database
psql grace_db

-- Create a user (password hash for 'password123')
INSERT INTO users (id, email, password_hash, email_verified)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
  true
);

-- Create profile
INSERT INTO profiles (user_id, first_name, last_name, email, organization_id)
SELECT id, 'Admin', 'User', email, '00000000-0000-0000-0000-000000000001'::uuid
FROM users WHERE email = 'admin@example.com';

-- Grant admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM users WHERE email = 'admin@example.com';
```

**Note:** The password hash above is a placeholder. Use bcrypt to generate a proper hash:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('password123', 10);
console.log(hash);
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready` or `docker compose ps`
- Check connection credentials in `server/.env`
- Ensure database exists: `psql -l | grep grace_db`

### Backend Issues

- Check server logs for errors
- Verify all environment variables are set
- Ensure migrations ran successfully
- Check port 3001 is not in use

### Frontend Issues

- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Ensure backend is running and accessible
- Check CORS settings if accessing from different origin

### Authentication Issues

- Verify JWT_SECRET is set
- Check token expiration settings
- Ensure user exists in database
- Verify password hash is correct

## Features Verified

✅ PostgreSQL database connection
✅ JWT-based authentication
✅ REST API for database operations
✅ Edge function replacements (AI assistant, generate minutes, Teams notifications)
✅ Email notification logging (Resend removed)
✅ Frontend client adapter compatibility
✅ Count queries support
✅ Complex query filters (eq, gte, lte, in, etc.)
✅ SQL injection protection

## Next Steps

1. Set up production environment variables
2. Configure proper JWT secret
3. Set up proper password hashing for user creation
4. Configure Teams webhook URLs in organizations table
5. Set up Lovable API key for AI features
6. Deploy to production environment

