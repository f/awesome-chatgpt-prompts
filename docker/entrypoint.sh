#!/bin/bash
set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🚀 prompts.chat - AI Prompt Library                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Generate AUTH_SECRET if not provided
if [ -z "$AUTH_SECRET" ]; then
    export AUTH_SECRET=$(openssl rand -base64 32)
    echo "⚠ AUTH_SECRET not provided, generated random secret"
    echo "  For production, set AUTH_SECRET environment variable"
fi

# PostgreSQL paths
PGDATA="/data/postgres"
PGBIN="/usr/lib/postgresql/15/bin"

# Initialize PostgreSQL data directory if needed
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "▶ Initializing PostgreSQL database..."
    
    # Initialize PostgreSQL
    su postgres -c "$PGBIN/initdb -D $PGDATA"
    
    # Configure PostgreSQL
    cat >> "$PGDATA/postgresql.conf" << EOF
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
EOF
    
    # Configure authentication
    cat > "$PGDATA/pg_hba.conf" << EOF
local all all trust
host all all 127.0.0.1/32 trust
host all all ::1/128 trust
EOF
    
    # Start PostgreSQL temporarily to create database
    su postgres -c "$PGBIN/pg_ctl -D $PGDATA -l /tmp/pg.log start"
    sleep 3
    
    # Create database and user
    su postgres -c "$PGBIN/createuser -s prompts 2>/dev/null" || true
    su postgres -c "$PGBIN/createdb -O prompts prompts 2>/dev/null" || true
    
    # Stop PostgreSQL (supervisor will start it)
    su postgres -c "$PGBIN/pg_ctl -D $PGDATA stop"
    sleep 2
    
    echo "✓ PostgreSQL initialized"
fi

# Start supervisor (manages PostgreSQL and Next.js)
echo "▶ Starting services..."
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &
SUPERVISOR_PID=$!

# Wait for PostgreSQL to be ready
echo "▶ Waiting for PostgreSQL..."
for i in $(seq 1 30); do
    if $PGBIN/pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        echo "✓ PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "✗ PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

# Run database migrations
echo "▶ Running database migrations..."
cd /app
./node_modules/prisma/build/index.js migrate deploy
echo "✓ Migrations complete"

# Seed database if empty (check if Prompt table exists and has data)
PROMPT_COUNT=$(su postgres -c "$PGBIN/psql -h localhost -U prompts -d prompts -t -c \"SELECT COUNT(*) FROM \\\"Prompt\\\"\"" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$PROMPT_COUNT" = "0" ] || [ -z "$PROMPT_COUNT" ]; then
    echo "▶ Seeding database with prompts..."
    # Run seed script if available
    if [ -f "/app/prisma/seed.ts" ]; then
        npx tsx /app/prisma/seed.ts || echo "⚠ Seeding skipped or failed"
    fi
    echo "✓ Database seeded"
else
    echo "✓ Database already has $PROMPT_COUNT prompts"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   ✅ prompts.chat is running!                                 ║"
echo "║                                                               ║"
echo "║   🌐 Open http://localhost:${PORT:-80} in your browser            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Keep container running and forward signals
wait $SUPERVISOR_PID
