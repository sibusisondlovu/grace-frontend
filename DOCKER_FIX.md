# Docker Signature Key Issue - Fix Guide

## Problem
Docker is showing "missing signature key" error when trying to pull PostgreSQL images.

## Solutions

### Option 1: Fix Docker Desktop Configuration (Recommended)

1. **Open Docker Desktop**
2. **Go to Settings** → **Docker Engine**
3. **Add or update** the following configuration:
   ```json
   {
     "experimental": false,
     "insecure-registries": [],
     "registry-mirrors": []
   }
   ```
4. **Restart Docker Desktop**
5. **Try again**:
   ```bash
   docker-compose up -d
   ```

### Option 2: Use Local PostgreSQL Installation

If Docker continues to have issues, install PostgreSQL locally:

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15

# Create database and user
createdb grace_db
psql grace_db -c "CREATE USER grace_user WITH PASSWORD 'grace_password';"
psql grace_db -c "GRANT ALL PRIVILEGES ON DATABASE grace_db TO grace_user;"
psql grace_db -c "ALTER USER grace_user WITH SUPERUSER;"

# Run initialization
psql grace_db < database/init.sql
```

### Option 3: Reset Docker Signature Verification

```bash
# Remove Docker's signature verification (use with caution)
# This may require Docker Desktop settings adjustment
```

### Option 4: Manual Container Start (if image exists)

If you have a postgres image already:
```bash
docker start grace-postgres
# or
docker run -d --name grace-postgres \
  -e POSTGRES_USER=grace_user \
  -e POSTGRES_PASSWORD=grace_password \
  -e POSTGRES_DB=grace_db \
  -p 5432:5432 \
  postgres:15
```

## After Database is Running

Once the database is accessible, run migrations:

```bash
cd server
npm run migrate
```

Then verify the connection:
```bash
curl http://localhost:3001/health
```

