#!/bin/bash

# Test cookie-based authentication

API_URL="http://localhost:5001/api"
COOKIES_FILE="/tmp/cookies.txt"

echo "🧪 Testing cookie-based authentication..."
echo ""

# 1. Register a new user
echo "1️⃣ Registering new user..."
REGISTER_RESPONSE=$(curl -s -c "$COOKIES_FILE" \
  -X POST "$API_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_cookies@example.com",
    "password": "TestPassword123!",
    "name": "Test Cookie User",
    "user_type": "individual"
  }')

echo "Register response: $REGISTER_RESPONSE"
echo ""

# 2. Check cookies
echo "2️⃣ Checking cookies..."
if [ -f "$COOKIES_FILE" ]; then
  echo "Cookies stored:"
  cat "$COOKIES_FILE"
  echo ""
else
  echo "⚠️ No cookies file found!"
fi

# 3. Get current user using cookies
echo "3️⃣ Getting current user with cookies..."
USER_RESPONSE=$(curl -s -b "$COOKIES_FILE" \
  -X GET "$API_URL/users/me" \
  -H "Content-Type: application/json")

echo "User response: $USER_RESPONSE"
echo ""

# 4. Login and check cookies
echo "4️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIES_FILE" \
  -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_cookies@example.com",
    "password": "TestPassword123!"
  }')

echo "Login response: $LOGIN_RESPONSE"
echo ""

echo "5️⃣ Cookies after login:"
cat "$COOKIES_FILE"

echo ""
echo "✅ Cookie test completed!"
