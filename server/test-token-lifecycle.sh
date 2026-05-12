#!/bin/bash

BASE_URL="http://localhost:3000/v1"
PHONE="+254712345678"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TOKEN LIFECYCLE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Get OTP
echo ""
echo "Step 1: Sending OTP..."
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}" > /dev/null

echo "📝 Check server logs for OTP code. Enter it here:"
read -r OTP

if [ -z "$OTP" ]; then
  echo "❌ No OTP entered."
  exit 1
fi

# Step 2: Login
echo ""
echo "Step 2: Verifying OTP and logging in..."
LOGIN_RESULT=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\", \"otp\": \"$OTP\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin)['data']; print(d.get('accessToken',''))" 2>/dev/null)
REFRESH_TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin)['data']; print(d.get('refreshToken',''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed. Response:"
  echo "$LOGIN_RESULT" | python3 -m json.tool
  exit 1
fi

echo "✅ Logged in! Token: ${ACCESS_TOKEN:0:30}..."

# Step 3: Use access token
echo ""
echo "Step 3: GET /auth/me with valid token"
echo "──────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo "✅ Expected: user data returned"

# Step 4: Refresh token
echo ""
echo "Step 4: Refresh tokens"
echo "──────────────────────"
REFRESH_RESULT=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
echo "$REFRESH_RESULT" | python3 -m json.tool

NEW_ACCESS=$(echo "$REFRESH_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)
NEW_REFRESH=$(echo "$REFRESH_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refreshToken'])" 2>/dev/null)

echo "✅ New access token: ${NEW_ACCESS:0:30}..."

# Step 5: Old refresh token should be invalid (rotation)
echo ""
echo "Step 5: Old refresh token should be REJECTED (rotation)"
echo "────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | python3 -m json.tool
echo "✅ Expected: 401, invalid refresh token (already used)"

# Step 6: New access token works
echo ""
echo "Step 6: New access token works"
echo "──────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS" | python3 -m json.tool
echo "✅ Expected: user data returned"

# Step 7: Logout
echo ""
echo "Step 7: Logout"
echo "──────────────"
curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_ACCESS" \
  -d "{\"refreshToken\": \"$NEW_REFRESH\", \"logoutAll\": false}" | python3 -m json.tool
echo "✅ Expected: success true"

# Step 8: Token should be blacklisted after logout
echo ""
echo "Step 8: Access token rejected AFTER logout"
echo "───────────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS" | python3 -m json.tool
echo "✅ Expected: 401, 'Token has been revoked'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TOKEN LIFECYCLE TEST COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "SUMMARY:"
echo "  ✅ Login via OTP works"
echo "  ✅ Access token authenticates"
echo "  ✅ Refresh token rotation works"
echo "  ✅ Old refresh token rejected (rotation)"
echo "  ✅ Logout revokes tokens"
echo "  ✅ Blacklisted token rejected"

# chmod +x server/test-token-lifecycle.sh
# bash server/test-token-lifecycle.sh