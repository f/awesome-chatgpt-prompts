#!/bin/sh
set -e

echo "🚀 Starting prompts.chat..."

# Extract host from DATABASE_URL for connection check
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')

# Wait for database
echo "⏳ Waiting for database..."
until nc -z "$DB_HOST" 5432 2>/dev/null; do
  sleep 2
done
echo "✅ Database is ready"

# Run migrations
echo "📦 Running migrations..."
prisma migrate deploy --schema=./prisma/schema.prisma
echo "✅ Migrations complete"

echo "🎉 Starting server..."
exec node server.js
