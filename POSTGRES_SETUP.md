# PostgreSQL Setup - Quick Guide

## Option 1: Manual Homebrew Installation (Recommended)

Run these commands in your terminal:

```bash
# Install PostgreSQL 15
brew install postgresql@15

# Add to PATH (add this to your ~/.zshrc for permanent)
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

# Start PostgreSQL
brew services start postgresql@15

# Wait a few seconds, then create database
createdb grace_db
psql grace_db -c "CREATE USER grace_user WITH PASSWORD 'grace_password';"
psql grace_db -c "GRANT ALL PRIVILEGES ON DATABASE grace_db TO grace_user;"
psql grace_db -c "ALTER USER grace_user WITH SUPERUSER;"

# Run initialization
psql grace_db < database/init.sql

# Run migrations
cd server
npm run migrate
```

## Option 2: Use the Setup Script

I've created a setup script for you. Run:

```bash
./setup_postgres.sh
```

## Option 3: Use Docker (After Fixing Docker)

Once Docker is updated to a newer version:

```bash
docker-compose up -d
cd server
npm run migrate
```

## Option 4: Use Remote Database

If you have access to a remote PostgreSQL database, update `server/.env`:

```env
DB_HOST=your-remote-host
DB_PORT=5432
DB_NAME=grace_db
DB_USER=grace_user
DB_PASSWORD=grace_password
```

Then run migrations:
```bash
cd server
npm run migrate
```

## Verify Installation

After setup, verify the database is running:

```bash
# Check if PostgreSQL is running
psql -h localhost -U grace_user -d grace_db -c "SELECT version();"

# Or test from Node.js
cd server
npm run migrate
```

