#!/bin/bash

BASE_URL="http://localhost:3000/v1"
PHONE="+254711111111"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 RATE LIMIT TEST — send-otp 6 times to same phone"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in {1..6}; do
  echo "Request $i of 6:"
  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/auth/send-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"$PHONE\"}")
  
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")
  
  echo "  Status: $HTTP_STATUS"
  echo "  Body: $BODY"
  echo ""
  
  # Small delay to see the effect
  sleep 0.5
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "EXPECTED:"
echo "  Requests 1-3: ✅ 200 (OTP sent)"
echo "  Request 4+:   ❌ 422 (Too many OTP requests)"
echo "  Note: Fastify rate limiter may kick in at 5/10min"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# chmod +x server/test-rate-limit.sh
# bash server/test-rate-limit.sh