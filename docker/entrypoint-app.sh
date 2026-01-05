#!/bin/sh
set -e

echo "🚀 Starting prompts.chat..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z ${DATABASE_HOST:-db} ${DATABASE_PORT:-5432}; do
  sleep 1
done
echo "✅ Database is ready"

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Check if database needs seeding
echo "🌱 Checking database..."
# Skip seed check in entrypoint, let the app handle it

echo "✨ prompts.chat is starting on port ${PORT:-3000}"

# Execute the main command
exec "$@"
