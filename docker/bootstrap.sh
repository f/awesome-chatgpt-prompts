#!/bin/bash
set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🚀 prompts.chat - AI Prompt Library                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Paths
APP_DIR="/data/app"
PGDATA="/data/postgres"
PGBIN="/usr/lib/postgresql/15/bin"
BUILD_MARKER="/data/.built"

# Generate AUTH_SECRET if not provided
if [ -z "$AUTH_SECRET" ]; then
    if [ -f "/data/.auth_secret" ]; then
        export AUTH_SECRET=$(cat /data/.auth_secret)
    else
        export AUTH_SECRET=$(openssl rand -base64 32)
        echo "$AUTH_SECRET" > /data/.auth_secret
        echo "⚠ AUTH_SECRET generated and saved"
    fi
fi

# Initialize PostgreSQL if needed
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "▶ Initializing PostgreSQL..."
    su postgres -c "$PGBIN/initdb -D $PGDATA"
    
    cat >> "$PGDATA/postgresql.conf" << EOF
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
EOF
    
    cat > "$PGDATA/pg_hba.conf" << EOF
local all all trust
host all all 127.0.0.1/32 trust
host all all ::1/128 trust
EOF
    
    su postgres -c "$PGBIN/pg_ctl -D $PGDATA -l /tmp/pg.log start"
    sleep 3
    su postgres -c "$PGBIN/createuser -s prompts 2>/dev/null" || true
    su postgres -c "$PGBIN/createdb -O prompts prompts 2>/dev/null" || true
    su postgres -c "$PGBIN/pg_ctl -D $PGDATA stop"
    sleep 2
    echo "✓ PostgreSQL initialized"
fi

# Clone and build on first run
if [ ! -f "$BUILD_MARKER" ]; then
    echo ""
    echo "▶ First run detected - building prompts.chat..."
    echo ""
    
    # Clone repository
    if [ ! -d "$APP_DIR/.git" ]; then
        echo "▶ Cloning repository..."
        rm -rf "$APP_DIR"
        git clone --depth 1 "$REPO_URL" "$APP_DIR"
        echo "✓ Repository cloned"
    fi
    
    cd "$APP_DIR"
    
    # Clean up unnecessary files
    rm -rf .github .claude packages .git
    
    # Install dependencies (including devDependencies needed for build)
    echo "▶ Installing dependencies..."
    NODE_ENV=development npm ci
    echo "✓ Dependencies installed"
    
    # Run docker-setup.js to generate config with branding
    echo "▶ Generating configuration..."
    node scripts/docker-setup.js
    echo "✓ Configuration generated"
    
    # Generate Prisma client
    echo "▶ Generating Prisma client..."
    npx prisma generate
    echo "✓ Prisma client generated"
    
    # Build Next.js
    echo "▶ Building Next.js application (this may take a few minutes)..."
    npm run build
    echo "✓ Build complete"
    
    # Mark as built
    touch "$BUILD_MARKER"
    
    echo ""
    echo "✅ Build complete! Starting application..."
    echo ""
else
    echo "✓ Using existing build"
    cd "$APP_DIR"
fi

# Start supervisor (manages PostgreSQL and Next.js)
echo "▶ Starting services..."
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &
SUPERVISOR_PID=$!

# Wait for PostgreSQL
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

# Run migrations
echo "▶ Running database migrations..."
npx prisma migrate deploy
echo "✓ Migrations complete"

# Seed if empty
PROMPT_COUNT=$(su postgres -c "$PGBIN/psql -h localhost -U prompts -d prompts -t -c \"SELECT COUNT(*) FROM \\\"Prompt\\\"\"" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$PROMPT_COUNT" = "0" ] || [ -z "$PROMPT_COUNT" ]; then
    echo "▶ Seeding database..."
    npx tsx prisma/seed.ts 2>/dev/null || echo "⚠ Seeding skipped"
    echo "✓ Database ready"
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

wait $SUPERVISOR_PID
