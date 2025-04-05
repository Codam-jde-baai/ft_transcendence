#!/bin/bash

# persistant data paths
DB_FILE="/app/data/data.db"
COOKIE_KEY="/app/cookie-key/secret-key"

# Check if the database file already exists
if [ ! -f "$DB_FILE" ]; then
    echo "Database file not found. Generating new database..."
    pnpm db:generate
    pnpm db:push --name=origin
    echo "Database setup complete."
else
    echo "Database file found at $DB_FILE.\nPLEASE CHECK FOR MIGRATIONS, IT WORKS ON MY COMPUTER"
fi

# Check if there is a cookie-key

if [ ! -f "$COOKIE_KEY" ]; then
    echo "There is no cookie key yet, generating key..."
	npx @fastify/secure-session > cookie-key/secret-key
    echo "generated cookie-key stored in cookie-key/secret-key"
else
    echo "Cookie-key already exists, nothing to be done"
fi

echo "Current directory: $(pwd)"
# checking start command
echo "Start command: $@"
exec "$@"