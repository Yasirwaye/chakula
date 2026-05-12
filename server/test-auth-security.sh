#!/bin/bash

BASE_URL="http://localhost:3000/v1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 AUTH MIDDLEWARE SECURITY TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── TEST A: No token at all ──
echo ""
echo "TEST A: GET /auth/me with NO token"
echo "───────────────────────────────────"
curl -s "$BASE_URL/auth/me" | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Access token is required'"

# ── TEST B: Garbage token ──
echo ""
echo "TEST B: GET /auth/me with GARBAGE token"
echo "────────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer this.is.not.a.real.token" | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Invalid access token'"

# ── TEST C: Expired-looking token ──
echo ""
echo "TEST C: GET /auth/me with EXPIRED token format"
echo "───────────────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0Iiwicm9sZSI6IkNVU1RPTUVSIiwic2Vzc2lvbklkIjoiZmFrZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid" | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Invalid access token'"

# ── TEST D: Missing 'Bearer' prefix ──
echo ""
echo "TEST D: Token without 'Bearer' prefix"
echo "──────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: some-token-without-bearer" | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Access token is required'"

# ── TEST E: Empty Authorization header ──
echo ""
echo "TEST E: Empty Authorization header"
echo "──────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: " | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Access token is required'"

# ── TEST F: Invalid route ──
echo ""
echo "TEST F: 404 — non-existent route"
echo "─────────────────────────────────"
curl -s "$BASE_URL/this-does-not-exist" | python3 -m json.tool
echo ""
echo "✅ Expected: 404, 'Route GET /v1/this-does-not-exist not found'"

# ── TEST G: Wrong HTTP method ──
echo ""
echo "TEST G: Wrong method — GET on POST-only route"
echo "──────────────────────────────────────────────"
curl -s "$BASE_URL/auth/send-otp" | python3 -m json.tool
echo ""
echo "✅ Expected: 404, route not found (GET is not registered)"

# ── TEST H: Invalid JSON body ──
echo ""
echo "TEST H: Invalid JSON body"
echo "─────────────────────────"
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d 'this is not json' 2>&1 | python3 -m json.tool
echo ""
echo "✅ Expected: 400, JSON parse error"

# ── TEST I: Missing required fields ──
echo ""
echo "TEST I: Missing required field (no phone)"
echo "──────────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool
echo ""
echo "✅ Expected: 400, validation error for phone"

# ── TEST J: Invalid phone format ──
echo ""
echo "TEST J: Invalid phone number format"
echo "────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "abc123"}' | python3 -m json.tool
echo ""
echo "✅ Expected: 400, 'Invalid Kenyan phone number'"

# ── TEST K: SQL injection attempt ──
echo ""
echo "TEST K: SQL injection attempt in phone field"
echo "─────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "1; DROP TABLE users;--"}' | python3 -m json.tool
echo ""
echo "✅ Expected: 400, validation error (regex rejects it)"

# ── TEST L: XSS attempt ──
echo ""
echo "TEST L: XSS attempt in phone field"
echo "───────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "<script>alert(1)</script>"}' | python3 -m json.tool
echo ""
echo "✅ Expected: 400, validation error (regex rejects it)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL SECURITY TESTS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# chmod +x server/test-auth-security.sh
# bash server/test-auth-security.sh