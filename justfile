# Use dotenv (.env) automatically
set dotenv-load := true

# Use bash for recipe execution
set shell:=["bash", "-eu", "-o", "pipefail", "-c"]

project_name := "prompts.chat"

compose := "docker compose"

# IMPORTANT: these are compose SERVICE names, not container_name
app_service := "app"
db_service := "db"
pgadmin_service := "pgadmin"

db_user := env_var_or_default("POSTGRES_USER", "prompts")
db_name := env_var_or_default("POSTGRES_DB", "prompts")

app_url := env_var_or_default("APP_URL", "http://localhost:3000")
pgadmin_url := env_var_or_default("PGADMIN_URL", "http://localhost:5050")

default:
	@just --list

# -----------------------------
# Helpers
# -----------------------------

compose *args:
	@{{compose}} -f docker-compose.yml {{args}}


# -----------------------------
# Setup
# -----------------------------

clone:
	@if [[ -d "{{project_name}}" ]]; then \
	  echo "Folder '{{project_name}}' already exists; skipping clone."; \
	else \
	  git clone https://github.com/f/awesome-chatgpt-prompts.git {{project_name}}; \
	fi

gen-secret:
	@openssl rand -hex 32

# Create folders for bind mounts (if you use ./data)
init-data:
	@mkdir -p data/postgres data/pgadmin

# -----------------------------
# DEV lifecycle
# -----------------------------

build:
	@just compose build

up:
	@just compose up -d

up-dev:
	@just compose up --build

down:
	@just compose down

down-reset:
	@just compose down -v

restart:
	@just compose restart

ps:
	@just compose ps

logs *args:
	@just compose logs -f {{args}}

logs-app:
	@just compose logs -f {{app_service}}

logs-db:
	@just compose logs -f {{db_service}}

logs-pgadmin:
	@just compose logs -f {{pgadmin_service}}

url:
	@echo "{{app_url}}"

url-pgadmin:
	@echo "{{pgadmin_url}}"

# -----------------------------
# Exec / shells
# -----------------------------

sh-app:
	@just compose exec {{app_service}} sh

sh-db:
	@just compose exec {{db_service}} sh

sh-pgadmin:
	@just compose exec {{pgadmin_service}} sh

exec-app cmd:
	@just compose exec {{app_service}} sh -lc '{{cmd}}'

exec-db cmd:
	@just compose exec {{db_service}} sh -lc '{{cmd}}'

# -----------------------------
# Database
# -----------------------------

db-ready:
	@just compose exec {{db_service}} pg_isready -U {{db_user}} -d {{db_name}}

db-wait:
	@echo "Waiting for Postgres..."
	@until {{compose}} -f docker-compose.yml exec -T {{db_service}} pg_isready -U {{db_user}} -d {{db_name}} >/dev/null 2>&1; do sleep 1; done
	@echo "Postgres is ready."

psql:
	@just compose exec {{db_service}} psql -U {{db_user}} -d {{db_name}}

db-push:
	@just compose exec {{app_service}} npm run db:push

db-migrate:
	@just compose exec {{app_service}} npm run db:migrate

db-seed:
	@just compose exec {{app_service}} npm run db:seed

db-init:
	@just db-wait
	@just db-push

reset-all:
	@just down-reset
	@just build
	@just up
	@just db-init

# -----------------------------
# Utilities
# -----------------------------

config:
	@just compose config

validate:
	@just compose config -q
