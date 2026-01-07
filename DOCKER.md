# Docker Deployment Guide

Run your own prompts.chat instance with a single command.

## Quick Start

```bash
docker run -d \
  --name prompts \
  -p 4444:3000 \
  -v prompts-data:/data \
  ghcr.io/f/prompts.chat
```

**First run:** The container will clone the repository and build the app (~3-5 minutes).  
**Subsequent runs:** Starts immediately using the cached build.

Open http://localhost:4444 in your browser.

## Custom Branding

Customize your instance with environment variables:

```bash
docker run -d \
  --name my-prompts \
  -p 4444:3000 \
  -v prompts-data:/data \
  -e PCHAT_NAME="Acme Prompts" \
  -e PCHAT_DESCRIPTION="Our team's AI prompt library" \
  -e PCHAT_COLOR="#ff6600" \
  -e PCHAT_AUTH_PROVIDERS="github,google" \
  -e PCHAT_LOCALES="en,es,fr" \
  ghcr.io/f/prompts.chat
```

> **Note:** Branding is applied during the first build. To change branding later, delete the volume and re-run:
> ```bash
> docker rm -f my-prompts
> docker volume rm prompts-data
> docker run ... # with new env vars
> ```

## Configuration Variables

All variables are prefixed with `PCHAT_` to avoid conflicts.

#### Branding (`branding.*` in prompts.config.ts)

| Env Variable | Config Path | Description | Default |
|--------------|-------------|-------------|---------|
| `PCHAT_NAME` | `branding.name` | App name shown in UI | `My Prompt Library` |
| `PCHAT_DESCRIPTION` | `branding.description` | App description | `Collect, organize...` |
| `PCHAT_LOGO` | `branding.logo` | Logo path (in public/) | `/logo.svg` |
| `PCHAT_LOGO_DARK` | `branding.logoDark` | Dark mode logo | Same as `PCHAT_LOGO` |
| `PCHAT_FAVICON` | `branding.favicon` | Favicon path | `/logo.svg` |

#### Theme (`theme.*` in prompts.config.ts)

| Env Variable | Config Path | Description | Default |
|--------------|-------------|-------------|---------|
| `PCHAT_COLOR` | `theme.colors.primary` | Primary color (hex) | `#6366f1` |
| `PCHAT_THEME_RADIUS` | `theme.radius` | Border radius: `none\|sm\|md\|lg` | `sm` |
| `PCHAT_THEME_VARIANT` | `theme.variant` | UI style: `default\|flat\|brutal` | `default` |
| `PCHAT_THEME_DENSITY` | `theme.density` | Spacing: `compact\|default\|comfortable` | `default` |

#### Authentication (`auth.*` in prompts.config.ts)

| Env Variable | Config Path | Description | Default |
|--------------|-------------|-------------|---------|
| `PCHAT_AUTH_PROVIDERS` | `auth.providers` | Providers: `github,google,credentials` | `credentials` |
| `PCHAT_ALLOW_REGISTRATION` | `auth.allowRegistration` | Allow public signup | `true` |

#### Internationalization (`i18n.*` in prompts.config.ts)

| Env Variable | Config Path | Description | Default |
|--------------|-------------|-------------|---------|
| `PCHAT_LOCALES` | `i18n.locales` | Supported locales (comma-separated) | `en` |
| `PCHAT_DEFAULT_LOCALE` | `i18n.defaultLocale` | Default locale | `en` |

#### Features (`features.*` in prompts.config.ts)

| Env Variable | Config Path | Description | Default |
|--------------|-------------|-------------|---------|
| `PCHAT_FEATURE_PRIVATE_PROMPTS` | `features.privatePrompts` | Enable private prompts | `true` |
| `PCHAT_FEATURE_CHANGE_REQUESTS` | `features.changeRequests` | Enable versioning | `true` |
| `PCHAT_FEATURE_CATEGORIES` | `features.categories` | Enable categories | `true` |
| `PCHAT_FEATURE_TAGS` | `features.tags` | Enable tags | `true` |
| `PCHAT_FEATURE_COMMENTS` | `features.comments` | Enable comments | `true` |
| `PCHAT_FEATURE_AI_SEARCH` | `features.aiSearch` | Enable AI search | `false` |
| `PCHAT_FEATURE_AI_GENERATION` | `features.aiGeneration` | Enable AI generation | `false` |
| `PCHAT_FEATURE_MCP` | `features.mcp` | Enable MCP features | `false` |

## System Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH_SECRET` | Secret for authentication tokens | Auto-generated |
| `PORT` | Internal container port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Internal DB |

## Production Setup

For production, set `AUTH_SECRET` explicitly:

```bash
docker run -d \
  --name prompts \
  -p 4444:3000 \
  -v prompts-data:/data \
  -e AUTH_SECRET="$(openssl rand -base64 32)" \
  -e PCHAT_NAME="My Company Prompts" \
  ghcr.io/f/prompts.chat
```

### With OAuth Providers

```bash
docker run -d \
  --name prompts \
  -p 4444:3000 \
  -v prompts-data:/data \
  -e AUTH_SECRET="your-secret-key" \
  -e PCHAT_AUTH_PROVIDERS="github,google" \
  -e AUTH_GITHUB_ID="your-github-client-id" \
  -e AUTH_GITHUB_SECRET="your-github-client-secret" \
  -e AUTH_GOOGLE_ID="your-google-client-id" \
  -e AUTH_GOOGLE_SECRET="your-google-client-secret" \
  ghcr.io/f/prompts.chat
```

### With AI Features (OpenAI)

```bash
docker run -d \
  --name prompts \
  -p 4444:3000 \
  -v prompts-data:/data \
  -e PCHAT_FEATURE_AI_SEARCH="true" \
  -e OPENAI_API_KEY="sk-..." \
  ghcr.io/f/prompts.chat
```

## Custom Logo

Mount your logo file:

```bash
docker run -d \
  --name prompts \
  -p 4444:3000 \
  -v prompts-data:/data \
  -v ./my-logo.svg:/data/app/public/logo.svg \
  -e PCHAT_NAME="My App" \
  ghcr.io/f/prompts.chat
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

Build and run locally:

```bash
docker build -f docker/Dockerfile -t prompts.chat .
docker run -p 4444:3000 -v prompts-data:/data prompts.chat
```

## Health Check

The container includes a health check endpoint:

```bash
curl http://localhost:4444/api/health
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
- Ensure port 4444 is available: `lsof -i :4444`

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
  -p 4444:3000 \
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
        proxy_pass http://localhost:4444;
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
