# prompts.chat Docker Management
# ================================

.PHONY: help up down logs update restart clean

help:
	@echo "Usage:"
	@echo "  make up       - Start services"
	@echo "  make down     - Stop services"
	@echo "  make logs     - View logs"
	@echo "  make update   - Pull latest & rebuild (preserves data)"
	@echo "  make restart  - Restart services"
	@echo "  make clean    - Stop & delete all data (WARNING!)"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f app

restart:
	docker compose restart

# Update to latest version (preserves data)
update:
	@echo "📥 Pulling latest changes..."
	git pull origin main
	@echo "🔨 Rebuilding..."
	docker compose build
	@echo "🚀 Restarting..."
	docker compose up -d
	@echo "✅ Update complete! Data preserved."

# WARNING: Deletes all data
clean:
	@echo "⚠️  This will DELETE ALL DATA. Are you sure? [y/N]" && read ans && [ $${ans:-N} = y ]
	docker compose down -v
	@echo "✅ All data deleted."

