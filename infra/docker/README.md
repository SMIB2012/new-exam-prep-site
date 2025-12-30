# Docker Infrastructure

This directory contains the **single unified** Docker Compose configuration for local development.

**Canonical file:** `compose/docker-compose.dev.yml`

## Convenience Alias (Optional)

To avoid typing the long file path repeatedly, you can set up an alias:

**Bash/Zsh (Linux/Mac):**
```bash
alias dcup='docker compose -f infra/docker/compose/docker-compose.dev.yml up -d'
alias dcdown='docker compose -f infra/docker/compose/docker-compose.dev.yml down'
alias dclogs='docker compose -f infra/docker/compose/docker-compose.dev.yml logs -f'
alias dcexec='docker compose -f infra/docker/compose/docker-compose.dev.yml exec'
```

**PowerShell (Windows):**
```powershell
function dcup { docker compose -f infra/docker/compose/docker-compose.dev.yml up -d }
function dcdown { docker compose -f infra/docker/compose/docker-compose.dev.yml down }
function dclogs { docker compose -f infra/docker/compose/docker-compose.dev.yml logs -f }
function dcexec { docker compose -f infra/docker/compose/docker-compose.dev.yml exec $args }
```

Then you can use: `dcup`, `dcdown`, `dclogs`, `dcexec backend bash`, etc.

## Quick Start

1. **Copy environment file:**
   ```bash
   # From project root
   cp .env.example .env
   # Edit .env with your local values
   ```

2. **Start all services:**
   ```bash
   # From project root (required - paths are relative to compose file location)
   docker compose -f infra/docker/compose/docker-compose.dev.yml up -d
   
   # Or change to compose directory first
   cd infra/docker/compose
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **View logs:**
   ```bash
   # All services
   docker compose -f infra/docker/compose/docker-compose.dev.yml logs -f
   
   # Specific service
   docker compose -f infra/docker/compose/docker-compose.dev.yml logs -f backend
   ```

4. **Stop all services:**
   ```bash
   docker compose -f infra/docker/compose/docker-compose.dev.yml down
   ```

5. **Access service shells:**
   ```bash
   # Backend (Python/FastAPI)
   docker compose -f infra/docker/compose/docker-compose.dev.yml exec backend bash
   
   # Frontend (Node.js/Next.js)
   docker compose -f infra/docker/compose/docker-compose.dev.yml exec frontend sh
   
   # Postgres (SQL shell)
   docker compose -f infra/docker/compose/docker-compose.dev.yml exec postgres psql -U exam_user -d exam_platform
   
   # Redis (Redis CLI)
   docker compose -f infra/docker/compose/docker-compose.dev.yml exec redis redis-cli
   ```

6. **Run one-off commands:**
   ```bash
   # Run a command in backend container
   docker compose -f infra/docker/compose/docker-compose.dev.yml run --rm backend python manage.py migrate
   
   # Run a command in frontend container
   docker compose -f infra/docker/compose/docker-compose.dev.yml run --rm frontend npm install
   ```

7. **Rebuild and restart:**
   ```bash
   # Rebuild all services
   docker compose -f infra/docker/compose/docker-compose.dev.yml up -d --build
   
   # Rebuild specific service
   docker compose -f infra/docker/compose/docker-compose.dev.yml up -d --build backend
   ```

## Services and Ports

| Service | Port | Description |
|---------|------|-------------|
| **Postgres** | 5432 | Primary database |
| **Redis** | 6379 | Caching and session storage |
| **Neo4j** | 7474 (HTTP), 7687 (Bolt) | Graph database |
| **Elasticsearch** | 9200 | Search engine |
| **Backend** | 8000 | FastAPI application |
| **Frontend** | 3000 | Next.js application |

## Accessing Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Neo4j Browser**: http://localhost:7474
  - Default credentials: `neo4j` / `change_me` (update in `.env`)
- **Elasticsearch**: http://localhost:9200
  - Health check: http://localhost:9200/_cluster/health

## Environment Variables

All environment variables are defined in the root `.env.example` file. Copy it to `.env` and customize for your local setup.

**Important**: Never commit `.env` files to version control. Only `.env.example` files should be committed.

## Volumes

Data persistence is handled via named Docker volumes:
- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence
- `neo4j_data`: Neo4j database files
- `neo4j_logs`: Neo4j logs
- `elasticsearch_data`: Elasticsearch indices

To remove all data:
```bash
docker compose -f infra/docker/compose/docker-compose.dev.yml down -v
```

## Development Workflow

The compose file is configured for hot-reload development:
- Backend: Code changes trigger automatic reload via `uvicorn --reload`
- Frontend: Next.js dev server watches for changes

## Troubleshooting

### Port conflicts
If a port is already in use, update the port mapping in `docker-compose.dev.yml` or stop the conflicting service.

### Database connection issues
Ensure the `DATABASE_URL` in your `.env` matches the Postgres service configuration.

### Neo4j password reset
If you need to reset Neo4j password:
```bash
docker exec -it exam_platform_neo4j cypher-shell -u neo4j -p change_me
# Then change password in Cypher shell
```

### Elasticsearch memory issues
If Elasticsearch fails to start, ensure Docker has at least 2GB of memory allocated. The compose file sets `ES_JAVA_OPTS=-Xms512m -Xmx512m` for development.

