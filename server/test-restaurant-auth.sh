#!/bin/bash

BASE_URL="http://localhost:3000/v1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 RESTAURANT AUTH TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── TEST 1: Register new restaurant owner ──
echo ""
echo "TEST 1: Register new restaurant owner"
echo "──────────────────────────────────────"
REG_RESULT=$(curl -s -X POST "$BASE_URL/auth/restaurant/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chef Ali",
    "email": "ali@testrestaurant.co.ke",
    "password": "SecurePass123",
    "phone": "+254756789012"
  }')
echo "$REG_RESULT" | python3 -m json.tool

# Extract token
REST_TOKEN=$(echo "$REG_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

if [ -z "$REST_TOKEN" ]; then
  echo "❌ Registration failed or token not found"
  echo "Trying login instead (user may already exist)..."
  
  # ── TEST 2: Login existing restaurant owner ──
  echo ""
  echo "TEST 2: Login restaurant owner"
  echo "──────────────────────────────"
  LOGIN_RESULT=$(curl -s -X POST "$BASE_URL/auth/restaurant/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "ali@testrestaurant.co.ke",
      "password": "SecurePass123"
    }')
  echo "$LOGIN_RESULT" | python3 -m json.tool
  
  REST_TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)
fi

if [ -n "$REST_TOKEN" ]; then
  echo ""
  echo "✅ Got access token: ${REST_TOKEN:0:30}..."
  
  # ── TEST 3: Get profile ──
  echo ""
  echo "TEST 3: GET /auth/me with restaurant token"
  echo "───────────────────────────────────────────"
  curl -s "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $REST_TOKEN" | python3 -m json.tool
  echo ""
  echo "✅ Expected: user with role RESTAURANT"
fi

# ── TEST 4: Wrong password ──
echo ""
echo "TEST 4: Login with wrong password"
echo "──────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/restaurant/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@testrestaurant.co.ke",
    "password": "WrongPassword123"
  }' | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Invalid email or password'"

# ── TEST 5: Non-existent email ──
echo ""
echo "TEST 5: Login with non-existent email"
echo "──────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/restaurant/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nobody@doesnotexist.com",
    "password": "SomePassword123"
  }' | python3 -m json.tool
echo ""
echo "✅ Expected: 401, 'Invalid email or password'"

# ── TEST 6: Weak password ──
echo ""
echo "TEST 6: Register with weak password"
echo "────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/restaurant/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weak Pass",
    "email": "weak@test.com",
    "password": "123",
    "phone": "+254799000111"
  }' | python3 -m json.tool
echo ""
echo "✅ Expected: 400, password validation error"

# ── TEST 7: Duplicate email ──
echo ""
echo "TEST 7: Register with existing email"
echo "─────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/restaurant/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate",
    "email": "ali@testrestaurant.co.ke",
    "password": "SecurePass123",
    "phone": "+254799000222"
  }' | python3 -m json.tool
echo ""
echo "✅ Expected: 409, 'This email is already registered'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ RESTAURANT AUTH TESTS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# chmod +x server/test-restaurant-auth.sh
# bash server/test-restaurant-auth.sh