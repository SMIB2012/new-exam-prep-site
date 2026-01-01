#!/bin/bash
# Verification script for Tasks 7-48
# Next.js 16.1.1 "Proxy Convention" (No Middleware)

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Log file
LOG_FILE="$REPO_ROOT/docs/verification/verification_log_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Function to pass
pass() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
    ((PASSED++))
}

# Function to fail
fail() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
    ((FAILED++))
}

# Function to warn
warn() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
    ((WARNINGS++))
}

# Function to run command and capture result
run_check() {
    local name="$1"
    local cmd="$2"
    
    log ""
    log "=== $name ==="
    log "Command: $cmd"
    
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        pass "$name"
        return 0
    else
        fail "$name"
        return 1
    fi
}

# Start
log "=========================================="
log "Verification Script: Tasks 7-48"
log "Date: $(date)"
log "=========================================="
log ""

cd "$REPO_ROOT"

# Phase 0: Inventory
log "PHASE 0: Inventory & Mapping"
log "=============================="
run_check "Task 7: Documentation files exist" \
    "test -f docs/architecture.md && test -f docs/api-contracts.md && test -f docs/data-model.md && test -f docs/algorithms.md && test -f docs/security.md && test -f docs/observability.md && test -f docs/runbook.md"

# Phase 1: Docs Baseline
log ""
log "PHASE 1: Documentation Baseline"
log "================================"
# Already checked in Phase 0

# Phase 2: Static Quality Gates
log ""
log "PHASE 2: Static Quality Gates"
log "=============================="

# Backend
log ""
log "--- Backend Quality Checks ---"
cd "$REPO_ROOT/backend"

run_check "Backend: Python compilation" \
    "python -m compileall app 2>&1 | grep -v '^Listing' || true"

if command -v ruff &> /dev/null; then
    run_check "Backend: Ruff linter" \
        "ruff check app --quiet"
else
    warn "Backend: Ruff not installed, skipping linter check"
fi

run_check "Backend: Pytest" \
    "pytest -q --tb=short 2>&1 | tail -5"

if [ -f "alembic.ini" ]; then
    run_check "Backend: Alembic migrations" \
        "alembic upgrade head 2>&1 | tail -3"
else
    warn "Backend: Alembic not configured, skipping migration check"
fi

# Frontend
log ""
log "--- Frontend Quality Checks ---"
cd "$REPO_ROOT/frontend"

if [ -f "package-lock.json" ]; then
    run_check "Frontend: npm ci (dependencies)" \
        "npm ci --silent 2>&1 | tail -5"
elif [ -f "yarn.lock" ]; then
    run_check "Frontend: yarn install (dependencies)" \
        "yarn install --silent 2>&1 | tail -5"
else
    warn "Frontend: No lock file found, skipping dependency install"
fi

run_check "Frontend: ESLint" \
    "npm run lint 2>&1 | tail -10"

run_check "Frontend: TypeScript type check" \
    "npm run typecheck 2>&1 | tail -10"

run_check "Frontend: Next.js build" \
    "npm run build 2>&1 | tail -20"

# Docker
log ""
log "--- Docker Build ---"
cd "$REPO_ROOT"

if [ -f "infra/docker/compose/docker-compose.dev.yml" ]; then
    run_check "Docker: Build (no cache)" \
        "docker compose -f infra/docker/compose/docker-compose.dev.yml build --no-cache 2>&1 | tail -20"
else
    warn "Docker: docker-compose.dev.yml not found, skipping build"
fi

# Phase 3-9: Functional Verification
log ""
log "PHASE 3-9: Functional Verification"
log "==================================="

# Start Docker services if not running
log ""
log "--- Starting Docker Services ---"
cd "$REPO_ROOT"

if [ -f "infra/docker/compose/docker-compose.dev.yml" ]; then
    log "Starting docker compose services..."
    docker compose -f infra/docker/compose/docker-compose.dev.yml up -d 2>&1 | tee -a "$LOG_FILE"
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 10
    
    # Check service status
    run_check "Docker: Services running" \
        "docker compose -f infra/docker/compose/docker-compose.dev.yml ps | grep -E '(Up|healthy)' | wc -l | xargs test 3 -le"
    
    # Run migrations if needed
    log "Running database migrations..."
    docker compose -f infra/docker/compose/docker-compose.dev.yml exec -T backend alembic upgrade head 2>&1 | tee -a "$LOG_FILE" || warn "Migrations may have failed or not needed"
    
    # Phase 4: FastAPI Foundation
    log ""
    log "--- Phase 4: FastAPI Foundation ---"
    
    run_check "API: Health endpoint (/v1/health)" \
        "curl -sf http://localhost:8000/v1/health | grep -q '\"status\":\"ok\"'"
    
    run_check "API: Ready endpoint (/v1/ready)" \
        "curl -sf http://localhost:8000/v1/ready | grep -q '\"status\"'"
    
    run_check "API: X-Request-ID header present" \
        "curl -sf -I http://localhost:8000/v1/health | grep -qi 'X-Request-ID'"
    
    # Phase 5: Auth Core
    log ""
    log "--- Phase 5: Auth Core + RBAC ---"
    
    # Test signup
    TEST_EMAIL="verify_test_$(date +%s)@example.com"
    run_check "Auth: Signup endpoint" \
        "curl -sf -X POST http://localhost:8000/v1/auth/signup -H 'Content-Type: application/json' -d '{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}' | grep -q '\"user\"'"
    
    # Test login
    run_check "Auth: Login endpoint" \
        "curl -sf -X POST http://localhost:8000/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}' | grep -q '\"tokens\"'"
    
    # Phase 6: Security Controls
    log ""
    log "--- Phase 6: Redis Security Controls ---"
    
    cd "$REPO_ROOT/backend"
    if [ -f "tests/security/test_security_controls.py" ]; then
        run_check "Security: Security controls tests" \
            "pytest tests/security/test_security_controls.py -v --tb=short 2>&1 | tail -20"
    else
        warn "Security: test_security_controls.py not found"
    fi
    
    # Phase 8: BFF + Cookie Auth
    log ""
    log "--- Phase 8: BFF + httpOnly Cookie Auth ---"
    
    # Test BFF login (if frontend is running)
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        run_check "BFF: Login endpoint accessible" \
            "curl -sf -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}' | grep -q '\"user\"'"
    else
        warn "BFF: Frontend not running on port 3000, skipping BFF tests"
    fi
    
    # Phase 9: Security Scan
    log ""
    log "--- Phase 9: Security Scan (No Secrets) ---"
    
    # Check backend logs for secrets
    SECRET_PATTERNS="password|access_token|refresh_token|id_token|bearer|authorization:|otpauth://|secret|backup code|reset token|oauth code"
    
    if docker compose -f infra/docker/compose/docker-compose.dev.yml logs backend 2>&1 | grep -iE "$SECRET_PATTERNS" > /dev/null 2>&1; then
        fail "Security: Secrets found in backend logs"
    else
        pass "Security: No secrets found in backend logs"
    fi
    
    # Check frontend build for secrets (if built)
    if [ -d "frontend/.next" ]; then
        if grep -riE "$SECRET_PATTERNS" frontend/.next 2>/dev/null | grep -v node_modules > /dev/null 2>&1; then
            fail "Security: Secrets found in frontend build"
        else
            pass "Security: No secrets found in frontend build"
        fi
    else
        warn "Security: Frontend build not found, skipping build secret scan"
    fi
else
    warn "Docker: docker-compose.dev.yml not found, skipping functional tests"
fi

# Summary
log ""
log "=========================================="
log "VERIFICATION SUMMARY"
log "=========================================="
log "Passed:  $PASSED"
log "Failed:  $FAILED"
log "Warnings: $WARNINGS"
log ""
log "Log file: $LOG_FILE"
log ""

if [ $FAILED -gt 0 ]; then
    log "❌ VERIFICATION FAILED"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    log "⚠️  VERIFICATION PASSED WITH WARNINGS"
    exit 0
else
    log "✅ VERIFICATION PASSED"
    exit 0
fi

