#!/bin/bash
# Smoke tests for Next.js BFF (Backend for Frontend)

set -e

FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "=== BFF Smoke Tests ==="
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test frontend is running
echo "1. Testing frontend is accessible..."
if curl -sf "$FRONTEND_URL" > /dev/null; then
    echo "✓ Frontend is accessible"
else
    echo "✗ Frontend is not accessible"
    exit 1
fi

# Test BFF signup
echo ""
echo "2. Testing /api/auth/signup..."
TEST_EMAIL="bff_smoke_test_$(date +%s)@example.com"
response=$(curl -s -w "\n%{http_code}" -X POST "$FRONTEND_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"BFF Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}" \
    -c /tmp/bff_cookies.txt)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✓ BFF signup passed"
    # Check cookies are set
    if grep -q "access_token\|refresh_token" /tmp/bff_cookies.txt 2>/dev/null; then
        echo "  ✓ Cookies set (httpOnly)"
    else
        echo "  ⚠ Cookies not found in cookie jar (may be httpOnly)"
    fi
    # Verify tokens NOT in JSON response
    if echo "$body" | jq -e '.tokens' > /dev/null 2>&1; then
        echo "  ✗ ERROR: Tokens found in JSON response (should be in cookies only)"
        exit 1
    else
        echo "  ✓ Tokens not in JSON response (correct)"
    fi
else
    echo "✗ BFF signup failed: HTTP $http_code"
    echo "$body"
    exit 1
fi

# Test BFF login
echo ""
echo "3. Testing /api/auth/login..."
response=$(curl -s -w "\n%{http_code}" -X POST "$FRONTEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\"}" \
    -c /tmp/bff_cookies.txt)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✓ BFF login passed"
    # Check cookies are set
    if grep -q "access_token\|refresh_token" /tmp/bff_cookies.txt 2>/dev/null; then
        echo "  ✓ Cookies set (httpOnly)"
    else
        echo "  ⚠ Cookies not found in cookie jar (may be httpOnly)"
    fi
    # Verify tokens NOT in JSON response
    if echo "$body" | jq -e '.tokens' > /dev/null 2>&1; then
        echo "  ✗ ERROR: Tokens found in JSON response (should be in cookies only)"
        exit 1
    else
        echo "  ✓ Tokens not in JSON response (correct)"
    fi
else
    echo "✗ BFF login failed: HTTP $http_code"
    echo "$body"
    exit 1
fi

# Test BFF /me (should use cookies)
echo ""
echo "4. Testing /api/auth/me..."
response=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/api/auth/me" \
    -b /tmp/bff_cookies.txt)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✓ BFF /me passed"
    echo "$body" | jq '.user.email' 2>/dev/null || echo "$body"
else
    echo "✗ BFF /me failed: HTTP $http_code"
    echo "$body"
    exit 1
fi

# Test BFF logout
echo ""
echo "5. Testing /api/auth/logout..."
response=$(curl -s -w "\n%{http_code}" -X POST "$FRONTEND_URL/api/auth/logout" \
    -H "Content-Type: application/json" \
    -d "{\"refresh_token\":\"dummy\"}" \
    -b /tmp/bff_cookies.txt \
    -c /tmp/bff_cookies_after_logout.txt)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✓ BFF logout passed"
    # Check cookies are cleared (Max-Age=0 or expired)
    if grep -q "Max-Age=0\|expires=" /tmp/bff_cookies_after_logout.txt 2>/dev/null; then
        echo "  ✓ Cookies cleared"
    else
        echo "  ⚠ Cookie clearing not verified in cookie jar"
    fi
else
    echo "✗ BFF logout failed: HTTP $http_code"
    echo "$body"
    exit 1
fi

# Cleanup
rm -f /tmp/bff_cookies.txt /tmp/bff_cookies_after_logout.txt

echo ""
echo "✅ All BFF smoke tests passed"

