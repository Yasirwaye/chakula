#!/bin/bash

BASE_URL="http://localhost:3000/v1"
PHONE="+254722222222"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 OTP LOCKOUT TEST — wrong OTP 6 times"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# First send a real OTP
echo "Step 1: Sending OTP to $PHONE..."
SEND_RESULT=$(curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}")
echo "  $SEND_RESULT"
echo ""

# Now try wrong OTPs
for i in {1..6}; do
  echo "Attempt $i — wrong OTP '000000':"
  RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"$PHONE\", \"otp\": \"000000\"}")
  echo "  $RESPONSE"
  echo ""
  sleep 0.3
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "EXPECTED:"
echo "  Attempts 1-4: ❌ 'Incorrect OTP. X attempts remaining'"
echo "  Attempt 5:    🔒 'Too many wrong attempts. Phone locked for 15 minutes'"
echo "  Attempt 6:    🔒 'Too many attempts. Try again in X minutes'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


# chmod +x server/test-otp-lockout.sh
# bash server/test-otp-lockout.sh