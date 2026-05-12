#!/bin/bash

BASE_URL="http://localhost:3000/v1"
PHONE="+254712345678"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 CHAKULA AUTH API TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 1: Send OTP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 1: Send OTP to $PHONE"
echo "─────────────────────────"

SEND_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}")

echo "Response: $SEND_RESPONSE"

# Check server logs for OTP
echo ""
echo "⚠️  Check server terminal for the OTP code (🔑 DEV: OTP Code)"
echo "Enter the OTP from server logs:"
read -r OTP

if [ -z "$OTP" ]; then
  echo "❌ No OTP entered. Exiting."
  exit 1
fi

echo "Using OTP: $OTP"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 2: Verify OTP (existing user)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 2: Verify OTP"
echo "──────────────────"

VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\", \"otp\": \"$OTP\"}")

echo "Response: $VERIFY_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ No access token received. Check OTP was correct."
  exit 1
fi

echo ""
echo "✅ Access Token received (first 50 chars): ${ACCESS_TOKEN:0:50}..."
echo "✅ Refresh Token received (first 20 chars): ${REFRESH_TOKEN:0:20}..."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 3: Get current user
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 3: GET /auth/me"
echo "────────────────────"

ME_RESPONSE=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $ME_RESPONSE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 4: Test NEW user flow
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW_PHONE="+254799888777"
echo ""
echo "TEST 4: New user OTP to $NEW_PHONE"
echo "───────────────────────────────────"

curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$NEW_PHONE\"}"

echo ""
echo "⚠️  Check server terminal for NEW user OTP:"
read -r NEW_OTP

NEW_VERIFY=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$NEW_PHONE\", \"otp\": \"$NEW_OTP\"}")

echo "Response: $NEW_VERIFY"

SETUP_TOKEN=$(echo $NEW_VERIFY | grep -o '"setupToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SETUP_TOKEN" ]; then
  echo "❌ No setup token. Check OTP."
  exit 1
fi

echo "✅ Setup token received: ${SETUP_TOKEN:0:30}..."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 5: Complete registration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 5: Complete registration"
echo "─────────────────────────────"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SETUP_TOKEN" \
  -d '{"name": "Test User", "email": "testuser999@example.com"}')

echo "Response: $REGISTER_RESPONSE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 6: Refresh token
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 6: Refresh token"
echo "─────────────────────"

REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Response: $REFRESH_RESPONSE"

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 7: Logout
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 7: Logout"
echo "──────────────"

# Get a fresh refresh token from the refresh response
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -d "{\"refreshToken\": \"$NEW_REFRESH_TOKEN\", \"logoutAll\": false}")

echo "Response: $LOGOUT_RESPONSE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 8: Use old token after logout (should fail)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 8: Old token after logout (should return 401)"
echo "───────────────────────────────────────────────────"

INVALID_RESPONSE=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Response: $INVALID_RESPONSE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEST 9: Rate limit test (send-otp 4 times fast)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "TEST 9: Restaurant login (wrong password)"
echo "─────────────────────────────────────────"

RESTAURANT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/restaurant/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "grace@mamaskitchen.co.ke", "password": "wrongpassword"}')

echo "Response: $RESTAURANT_LOGIN"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL AUTH TESTS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


# chmod +x server/test-auth.sh
# bash server/test-auth.sh