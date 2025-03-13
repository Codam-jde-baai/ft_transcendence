# Variables
DOCKER_COMPOSE_DEV = docker compose -f srcs/docker-compose.dev.yml
DOCKER_COMPOSE = docker-compose -f srcs/docker-compose.yml

VOLUME_DIR := ${HOME}/ft_transcendence/data

# Default target
.DEFAULT_GOAL := help

# Colors
GREEN		= \033[32;1m
RESET		= \033[0m

# Help
help:
	@echo "Available commands:"
	@echo "  make dev         - Start development environment"
	@echo "  make dev-rebuild - builds the images again and starts the contianers"
	@echo "  make down        - Stop all containers"
	@echo "  make build       - Rebuild all containers"
	@echo "  make rebuild     - Force rebuild all containers"
	@echo "  make logs        - View logs from all containers"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make install     - Install dependencies for both frontend and backend"
	@echo "  make prod        - Start production environment"
	@echo "  make volume      - creates the volume dir"
	@echo "  make copy-env    - copies env stored on local machine from ~/.transcendence.env to the right directory"


# Development commands
dev:
	@if [ ! -d "$(VOLUME_DIR)" ]; then \
		echo "Creating volume directory $(VOLUME_DIR)"; \
		mkdir -p $(VOLUME_DIR); \
	fi
	$(DOCKER_COMPOSE_DEV) up -d

dev-build:
	$(DOCKER_COMPOSE_DEV) build

dev-down:
	$(DOCKER_COMPOSE_DEV) down

dev-rebuild: 
	rm -rf ./srcs/backend/.pnpm-store
	make dev-down
	make dev-build
	make dev

build:
	$(DOCKER_COMPOSE) build

logs:
	$(DOCKER_COMPOSE_DEV) logs

clean-db:
	docker volume prune -af

clean:
	$(DOCKER_COMPOSE_DEV) down
	docker system prune -af

# Installation commands
install:
	cd frontend && npm install
	cd backend && npm install

# Production commands
prod:
	@if [ ! -d "$(VOLUME_DIR)" ]; then \
		echo "Creating volume directory $(VOLUME_DIR)"; \
		mkdir -p $(VOLUME_DIR); \
	fi
	$(DOCKER_COMPOSE) up -d

prod-down:
	$(DOCKER_COMPOSE) down

volume:
	mkdir -p ${HOME}/ft_transcendence/data

# since we cant send the env file to the git repository. store the env on your local machine in file ~/.transcendence.env - will share on slack
copy-env:
	cp ~/.transcendence.env ./srcs/.env

# All Docker resources are removed, stopped and deleted
deepclean: clean
	@echo "Cleaning up Docker resources..."
	@echo "Stopping containers..."
	@docker stop $$(docker ps -qa) 2>/dev/null || true
	@echo "Removing containers..."
	@docker rm $$(docker ps -qa) 2>/dev/null || true
	@echo "Removing images..."
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true
	@echo "Removing volumes..."
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	@echo "Removing networks..."
	@docker network rm $$(docker network ls -q) 2>/dev/null || true
	@echo "$(GREEN)All Docker resources have been cleaned.$(RESET)"

.PHONY: help dev dev-build down build dev-rebuild logs clean install prod prod-down volume copy-env deepclean

