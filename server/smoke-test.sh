#!/bin/bash
set -e

echo "=== Running UniLearn Smoke Tests ==="

# 1. Login to get token
echo "Logging in as admin..."
LOGIN_RES=$(curl.exe -s -X POST http://127.0.0.1:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uni.edu","password":"admin123"}')

ADMIN_TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -z "$ADMIN_TOKEN" ]; then
  echo "Error: Failed to obtain admin token"
  echo "Login response was: $LOGIN_RES"
  exit 1
fi
echo "Login successful!"

# 2. Find the user ID of hod@uni.edu (should have assignment records)
echo "Locating hod@uni.edu user ID..."
ALL_USERS=$(curl.exe -s -X GET http://127.0.0.1:8080/api/v1/users -H "Authorization: Bearer $ADMIN_TOKEN")
PROTECTED_USER_ID=$(echo "$ALL_USERS" | grep -o -E '\{"userId":[0-9]+,"fullName":"[^"]*","email":"hod@uni.edu"' | grep -o -E '"userId":[0-9]+' | cut -d: -f2 || true)
PROTECTED_USER_ID=$(echo "$PROTECTED_USER_ID" | tr -d '\r ')

if [ -z "$PROTECTED_USER_ID" ]; then
  echo "Error: Could not locate user ID for hod@uni.edu"
  exit 1
fi
echo "Located hod@uni.edu with ID: $PROTECTED_USER_ID"

# 3. Create a temporary student user
echo "Creating temporary student user..."
CREATE_RES=$(curl.exe -s -X POST http://127.0.0.1:8080/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Smoke Test Student","email":"smoketest@uni.edu","password":"password123","role":"Student","phone":"0771112222","status":"Active","departmentId":1,"batchId":1}')

USER_ID=$(echo "$CREATE_RES" | grep -o '"userId":[0-9]*' | grep -o '[0-9]*')
if [ -z "$USER_ID" ]; then
  echo "Error: Failed to create test user"
  echo "Response: $CREATE_RES"
  exit 1
fi
echo "Temporary student user created with ID: $USER_ID"

# 4. Delete the temporary student user (should return 204)
echo "Deleting temporary student user..."
DELETE_STATUS=$(curl.exe -s -o nul -w "%{http_code}" -X DELETE http://127.0.0.1:8080/api/v1/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN")
DELETE_STATUS=$(echo "$DELETE_STATUS" | tr -d '\r')

if [ "$DELETE_STATUS" -ne 204 ]; then
  echo "Error: Expected 204 status on deletion, got $DELETE_STATUS"
  exit 1
fi
echo "Clean user deletion path verified! (Status: 204)"

# 5. Try to delete student with academic data (should return 409)
echo "Verifying delete protection for user with academic data..."
PROTECTED_DELETE_STATUS=$(curl.exe -s -o nul -w "%{http_code}" -X DELETE http://127.0.0.1:8080/api/v1/users/$PROTECTED_USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN")
PROTECTED_DELETE_STATUS=$(echo "$PROTECTED_DELETE_STATUS" | tr -d '\r')

if [ "$PROTECTED_DELETE_STATUS" -ne 409 ]; then
  echo "Error: Expected 409 Conflict status on protected deletion, got $PROTECTED_DELETE_STATUS"
  exit 1
fi

PROTECTED_DELETE_RES=$(curl.exe -s -X DELETE http://127.0.0.1:8080/api/v1/users/$PROTECTED_USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if ! echo "$PROTECTED_DELETE_RES" | grep -q "Cannot permanently delete a user with existing academic records"; then
  echo "Error: Expected delete protection error message, got: $PROTECTED_DELETE_RES"
  exit 1
fi
echo "Delete protection verified! Received: $PROTECTED_DELETE_RES"

# 6. Verify self-service profile photo update for STUDENT (should be 200)
echo "Logging in as student..."
STUDENT_LOGIN_RES=$(curl.exe -s -X POST http://127.0.0.1:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@uni.edu","password":"admin123"}')

STUDENT_TOKEN=$(echo "$STUDENT_LOGIN_RES" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -z "$STUDENT_TOKEN" ]; then
  echo "Error: Failed to obtain student token"
  echo "Login response was: $STUDENT_LOGIN_RES"
  exit 1
fi

echo "Testing STUDENT self-service photo update on /api/v1/profile/me/photo..."
STUDENT_PHOTO_STATUS=$(curl.exe -s -o nul -w "%{http_code}" -X PATCH http://127.0.0.1:8080/api/v1/profile/me/photo \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"photoUrl":"https://res.cloudinary.com/demo/image/upload/sample.jpg"}')
STUDENT_PHOTO_STATUS=$(echo "$STUDENT_PHOTO_STATUS" | tr -d '\r')

if [ "$STUDENT_PHOTO_STATUS" -ne 200 ]; then
  echo "Error: Expected 200 status for student profile photo update, got $STUDENT_PHOTO_STATUS"
  exit 1
fi
echo "Student self-service photo update verified! (Status: 200)"

# 7. Verify security boundary: STUDENT PATCH to admin-only /api/v1/users/1 should be 403
echo "Testing STUDENT access to admin-only endpoint /api/v1/users/1..."
STUDENT_ADMIN_STATUS=$(curl.exe -s -o nul -w "%{http_code}" -X PATCH http://127.0.0.1:8080/api/v1/users/1/active?active=true \
  -H "Authorization: Bearer $STUDENT_TOKEN")
STUDENT_ADMIN_STATUS=$(echo "$STUDENT_ADMIN_STATUS" | tr -d '\r')

if [ "$STUDENT_ADMIN_STATUS" -ne 403 ]; then
  echo "Error: Expected 403 status for student accessing admin-only endpoint, got $STUDENT_ADMIN_STATUS"
  exit 1
fi
echo "Admin-only security boundary verified! (Status: 403)"

echo "=== All Smoke Tests Passed Successfully ==="
