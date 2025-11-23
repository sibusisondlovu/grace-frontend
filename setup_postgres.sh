#!/bin/bash
# Quick PostgreSQL setup script

echo "Installing PostgreSQL 15..."
brew install postgresql@15

echo "Adding PostgreSQL to PATH..."
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

echo "Starting PostgreSQL service..."
brew services start postgresql@15

echo "Waiting for PostgreSQL to start..."
sleep 5

echo "Creating database and user..."
/usr/local/opt/postgresql@15/bin/createdb grace_db || true
/usr/local/opt/postgresql@15/bin/psql grace_db -c "CREATE USER grace_user WITH PASSWORD 'grace_password';" || true
/usr/local/opt/postgresql@15/bin/psql grace_db -c "GRANT ALL PRIVILEGES ON DATABASE grace_db TO grace_user;" || true
/usr/local/opt/postgresql@15/bin/psql grace_db -c "ALTER USER grace_user WITH SUPERUSER;" || true

echo "Running initialization script..."
/usr/local/opt/postgresql@15/bin/psql grace_db < database/init.sql || true

echo "Setup complete!"
