# Quick Start Guide

## Start the Development Servers

### 1. Start Backend Server

Open a terminal and run:

```bash
cd server
npm install  # First time only
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Start Frontend Server

Open another terminal and run:

```bash
# From project root
npm install  # First time only
npm run dev
```

The frontend will start on `http://localhost:8080`

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:8080
- **Backend Health Check**: http://localhost:3001/health

## Troubleshooting

### Connection Refused Error

If you see "ERR_CONNECTION_REFUSED":

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok"}`

2. **Check if frontend is running:**
   ```bash
   curl http://localhost:8080
   ```
   Should return HTML content

3. **Check if database is running:**
   ```bash
   docker compose ps
   # or
   pg_isready -h localhost -p 5432
   ```

### Port Already in Use

If a port is already in use:

**Backend (3001):**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

**Frontend (8080):**
```bash
# Find process using port 8080
lsof -i :8080
# Kill it
kill -9 <PID>
```

Or change the port in:
- Backend: `server/.env` (PORT=3001)
- Frontend: `vite.config.ts` (port: 8080)

## Environment Setup

### Backend Environment Variables

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
FRONTEND_URL=http://localhost:8080

LOVABLE_API_KEY=your-lovable-api-key
```

### Frontend Environment Variables

Create `.env` in project root:

```env
VITE_API_URL=http://localhost:3001
```

## Database Setup

If using Docker:

```bash
docker compose up -d
```

If using local PostgreSQL:

```bash
createdb grace_db
psql grace_db < database/init.sql
```

Then run migrations:

```bash
cd server
npm run migrate
```

## Verify Everything is Working

1. Backend health: http://localhost:3001/health
2. Frontend: http://localhost:8080
3. Check browser console for any errors
4. Try logging in (create a user first if needed)

