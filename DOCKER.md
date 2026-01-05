# Docker Deployment Guide

Run prompts.chat with a single command using Docker.

## Quick Start (All-in-One Image)

The easiest way to run prompts.chat - a single container with Node.js and PostgreSQL:

```bash
docker run -d \
  --name prompts \
  -p 80:80 \
  -v prompts-data:/data \
  ghcr.io/f/prompts.chat
```

Open http://localhost in your browser.

## Whitelabel / Custom Branding

Build your own branded image with custom name, logo, and colors:

```bash
docker build \
  --build-arg BRAND_NAME="My Prompt Library" \
  --build-arg BRAND_DESCRIPTION="Our team's AI prompts" \
  --build-arg BRAND_COLOR="#ff6600" \
  --build-arg AUTH_PROVIDERS="github,google" \
  --build-arg LOCALES="en,es,fr" \
  -f docker/Dockerfile \
  -t my-prompts .

docker run -p 80:80 -v prompts-data:/data my-prompts
```

### Build Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `BRAND_NAME` | App name shown in UI | `My Prompt Library` |
| `BRAND_DESCRIPTION` | App description | `Collect, organize, and share AI prompts` |
| `BRAND_LOGO` | Logo path (in public/) | `/logo.svg` |
| `BRAND_LOGO_DARK` | Dark mode logo | Same as `BRAND_LOGO` |
| `BRAND_FAVICON` | Favicon path | `/logo.svg` |
| `BRAND_COLOR` | Primary color (hex) | `#6366f1` |
| `THEME_RADIUS` | Border radius: `none\|sm\|md\|lg` | `sm` |
| `THEME_VARIANT` | UI style: `default\|flat\|brutal` | `default` |
| `THEME_DENSITY` | Spacing: `compact\|default\|comfortable` | `default` |
| `AUTH_PROVIDERS` | Auth providers (comma-separated) | `credentials` |
| `ALLOW_REGISTRATION` | Allow public signup | `true` |
| `LOCALES` | Supported locales (comma-separated) | `en` |
| `DEFAULT_LOCALE` | Default locale | `en` |
| `FEATURE_PRIVATE_PROMPTS` | Enable private prompts | `true` |
| `FEATURE_CHANGE_REQUESTS` | Enable versioning | `true` |
| `FEATURE_CATEGORIES` | Enable categories | `true` |
| `FEATURE_TAGS` | Enable tags | `true` |
| `FEATURE_COMMENTS` | Enable comments | `true` |
| `FEATURE_AI_SEARCH` | Enable AI search | `false` |
| `FEATURE_AI_GENERATION` | Enable AI generation | `false` |
| `FEATURE_MCP` | Enable MCP features | `false` |

### Adding Custom Logo

1. Create your logo file (SVG recommended)
2. Mount it when running:

```bash
docker run -p 80:80 \
  -v ./my-logo.svg:/app/public/logo.svg \
  -v prompts-data:/data \
  my-prompts
```

Or include it in your own Dockerfile:

```dockerfile
FROM ghcr.io/f/prompts.chat
COPY my-logo.svg /app/public/logo.svg
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH_SECRET` | Secret for authentication tokens | Auto-generated |
| `PORT` | Port to run the app on | `80` |
| `DATABASE_URL` | PostgreSQL connection string | Internal DB |

### Production Setup

For production, always set `AUTH_SECRET`:

```bash
docker run -d \
  --name prompts \
  -p 80:80 \
  -v prompts-data:/data \
  -e AUTH_SECRET="your-secret-key-min-32-chars-long" \
  ghcr.io/f/prompts.chat
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### With OAuth Providers

Enable GitHub/Google authentication:

```bash
docker run -d \
  --name prompts \
  -p 80:80 \
  -v prompts-data:/data \
  -e AUTH_SECRET="your-secret-key" \
  -e AUTH_GITHUB_ID="your-github-client-id" \
  -e AUTH_GITHUB_SECRET="your-github-client-secret" \
  -e AUTH_GOOGLE_ID="your-google-client-id" \
  -e AUTH_GOOGLE_SECRET="your-google-client-secret" \
  ghcr.io/f/prompts.chat
```

### With AI Search (OpenAI)

Enable semantic search with OpenAI embeddings:

```bash
docker run -d \
  --name prompts \
  -p 80:80 \
  -v prompts-data:/data \
  -e AUTH_SECRET="your-secret-key" \
  -e OPENAI_API_KEY="sk-..." \
  ghcr.io/f/prompts.chat
```

## Docker Compose (Separate Containers)

For more control, use Docker Compose with separate app and database containers:

```bash
# Clone the repository
git clone https://github.com/f/awesome-chatgpt-prompts.git
cd awesome-chatgpt-prompts

# Create .env file
echo "AUTH_SECRET=$(openssl rand -base64 32)" > .env

# Start services
docker compose up -d
```

### docker-compose.yml

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.app
    ports:
      - "80:3000"
    environment:
      - DATABASE_URL=postgresql://prompts:prompts@db:5432/prompts
      - AUTH_SECRET=${AUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=prompts
      - POSTGRES_PASSWORD=prompts
      - POSTGRES_DB=prompts
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prompts"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Data Persistence

### All-in-One Image

Data is stored in `/data` inside the container:
- `/data/postgres` - PostgreSQL database files

Mount a volume to persist data:

```bash
docker run -d \
  -v prompts-data:/data \
  ghcr.io/f/prompts.chat
```

### Backup

```bash
# Backup database
docker exec prompts pg_dump -U prompts prompts > backup.sql

# Restore database
docker exec -i prompts psql -U prompts prompts < backup.sql
```

## Building Locally

Build the all-in-one image:

```bash
docker build -f docker/Dockerfile -t prompts.chat .
docker run -p 80:80 prompts.chat
```

Build the app-only image (for docker-compose):

```bash
docker build -f docker/Dockerfile.app -t prompts.chat-app .
```

## Health Check

The container includes a health check endpoint:

```bash
curl http://localhost/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## Troubleshooting

### View Logs

```bash
# All logs
docker logs prompts

# Follow logs
docker logs -f prompts

# PostgreSQL logs (inside container)
docker exec prompts cat /var/log/supervisor/postgresql.log

# Next.js logs (inside container)
docker exec prompts cat /var/log/supervisor/nextjs.log
```

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it prompts psql -U prompts -d prompts

# Run SQL query
docker exec prompts psql -U prompts -d prompts -c "SELECT COUNT(*) FROM \"Prompt\""
```

### Container Shell

```bash
docker exec -it prompts bash
```

### Common Issues

**Container won't start:**
- Check logs: `docker logs prompts`
- Ensure port 80 is available: `lsof -i :80`

**Database connection errors:**
- Wait for PostgreSQL to initialize (can take 30-60 seconds on first run)
- Check database logs: `docker exec prompts cat /var/log/supervisor/postgresql.log`

**Authentication issues:**
- Ensure `AUTH_SECRET` is set for production
- For OAuth, verify callback URLs are configured correctly

## Resource Requirements

Minimum:
- 1 CPU core
- 1GB RAM
- 2GB disk space

Recommended:
- 2 CPU cores
- 2GB RAM
- 10GB disk space

## Updating

```bash
# Pull latest image
docker pull ghcr.io/f/prompts.chat

# Stop and remove old container
docker stop prompts && docker rm prompts

# Start new container (data persists in volume)
docker run -d \
  --name prompts \
  -p 80:80 \
  -v prompts-data:/data \
  -e AUTH_SECRET="your-secret-key" \
  ghcr.io/f/prompts.chat
```

## Security Considerations

1. **Always set AUTH_SECRET** in production
2. **Use HTTPS** - put a reverse proxy (nginx, Caddy, Traefik) in front
3. **Limit exposed ports** - only expose what's needed
4. **Regular updates** - pull the latest image regularly
5. **Backup data** - regularly backup the `/data` volume

## Example: Running Behind Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name prompts.example.com;

    ssl_certificate /etc/letsencrypt/live/prompts.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prompts.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## License

MIT
