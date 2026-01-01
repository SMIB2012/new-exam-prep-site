#!/bin/bash
# Smoke tests for FastAPI backend

set -e

BASE_URL="${API_BASE_URL:-http://localhost:8000}"
API_PREFIX="/v1"

echo "=== API Smoke Tests ==="
echo "Base URL: $BASE_URL"
echo ""

# Test health
echo "1. Testing /v1/health..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL$API_PREFIX/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✓ Health check passed"
else
    echo "✗ Health check failed: HTTP $http_code"
    exit 1
fi

# Test ready
echo ""
echo "2. Testing /v1/ready..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL$API_PREFIX/ready")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✓ Ready check passed"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "✗ Ready check failed: HTTP $http_code"
    exit 1
fi

# Test signup
echo ""
echo "3. Testing /v1/auth/signup..."
TEST_EMAIL="smoke_test_$(date +%s)@example.com"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$API_PREFIX/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Smoke Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
    echo "✓ Signup passed"
    # Extract tokens (should not be in response for BFF, but check structure)
    echo "$body" | jq '.user.email' 2>/dev/null || echo "$body"
else
    echo "✗ Signup failed: HTTP $http_code"
    echo "$body"
    exit 1
fi

# Test login
echo ""
echo "4. Testing /v1/auth/login..."
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$API_PREFIX/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✓ Login passed"
    # Extract access token for next test
    ACCESS_TOKEN=$(echo "$body" | jq -r '.tokens.access_token' 2>/dev/null || echo "")
    if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
        echo "  Access token received"
    fi
else
    echo "✗ Login failed: HTTP $http_code"
    echo "$body"
    exit 1
fi

# Test /me with token
if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo ""
    echo "5. Testing /v1/auth/me..."
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$API_PREFIX/auth/me" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo "✓ /me passed"
        echo "$body" | jq '.user.email' 2>/dev/null || echo "$body"
    else
        echo "✗ /me failed: HTTP $http_code"
        echo "$body"
        exit 1
    fi
fi

echo ""
echo "✅ All API smoke tests passed"

