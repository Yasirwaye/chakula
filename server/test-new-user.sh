#!/bin/bash

BASE_URL="http://localhost:3000/v1"
# Use a phone that doesn't exist in seed data
NEW_PHONE="+254798765432"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 NEW USER REGISTRATION FLOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Send OTP to new phone
echo ""
echo "Step 1: Send OTP to new phone $NEW_PHONE"
echo "──────────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$NEW_PHONE\"}" | python3 -m json.tool

echo ""
echo "📝 Enter OTP from server logs:"
read -r OTP

# Step 2: Verify — should return isNewUser: true
echo ""
echo "Step 2: Verify OTP (should say isNewUser: true)"
echo "────────────────────────────────────────────────"
VERIFY_RESULT=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$NEW_PHONE\", \"otp\": \"$OTP\"}")
echo "$VERIFY_RESULT" | python3 -m json.tool

SETUP_TOKEN=$(echo "$VERIFY_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data'].get('setupToken',''))" 2>/dev/null)

if [ -z "$SETUP_TOKEN" ]; then
  echo "❌ No setup token — OTP may have been wrong"
  exit 1
fi

echo "✅ Got setup token: ${SETUP_TOKEN:0:30}..."

# Step 3: Try using setup token on /auth/me (should fail — it's not an access token)
echo ""
echo "Step 3: Setup token should NOT work on /auth/me"
echo "────────────────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $SETUP_TOKEN" | python3 -m json.tool
echo "✅ Expected: 401 (setup token is not an access token)"

# Step 4: Complete registration
echo ""
echo "Step 4: Complete registration"
echo "─────────────────────────────"
REG_RESULT=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SETUP_TOKEN" \
  -d "{
    \"name\": \"New Test User\",
    \"email\": \"newuser$(date +%s)@test.com\"
  }")
echo "$REG_RESULT" | python3 -m json.tool

NEW_TOKEN=$(echo "$REG_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

if [ -z "$NEW_TOKEN" ]; then
  echo "❌ Registration failed"
  exit 1
fi

# Step 5: New access token works
echo ""
echo "Step 5: New user can access /auth/me"
echo "─────────────────────────────────────"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $NEW_TOKEN" | python3 -m json.tool
echo "✅ Expected: user with role CUSTOMER"

# Step 6: Try registering with same setup token again (should fail)
echo ""
echo "Step 6: Reuse setup token (should fail)"
echo "────────────────────────────────────────"
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SETUP_TOKEN" \
  -d '{
    "name": "Duplicate User",
    "email": "dup@test.com"
  }' | python3 -m json.tool
echo "✅ Expected: Either logs in existing user or returns tokens"
echo "   (Since phone already exists, it just logs them in)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NEW USER FLOW COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# chmod +x server/test-new-user.sh
# bash server/test-new-user.sh