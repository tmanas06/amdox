#!/bin/bash

# Configuration
API_URL="http://localhost:5005/api"
RANDOM_NUM=$((1 + $RANDOM % 100000))
EMAIL="testseeker_${RANDOM_NUM}@example.com"
PASSWORD="password123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting Verification of getApplicationById endpoint..."
echo "Target: $API_URL"
echo "User: $EMAIL"

# 1. Register
echo "1. Registering..."
# Try register directly with unique email
RESP=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Seeker\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\",\"role\":\"job_seeker\"}")

TOKEN=$(echo "$RESP" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ Registration failed${NC}"
    echo "Response: $RESP"
    exit 1
fi
echo -e "${GREEN}✅ Authenticated (Registered)${NC}"

# 2. Get a Job ID
echo "2. Finding a job..."
JOB_RESP=$(curl -s "$API_URL/jobs")
JOB_ID=$(echo "$JOB_RESP" | jq -r '.data[0]._id')

if [ -z "$JOB_ID" ] || [ "$JOB_ID" == "null" ]; then
    echo -e "${RED}❌ No jobs found${NC}"
    echo "Response: $JOB_RESP"
    exit 1
fi
echo -e "${GREEN}✅ Found Job ID: $JOB_ID${NC}"

# 3. Apply to Job
echo "3. Being sure we applied..."
APPLY_RESP=$(curl -s -X POST "$API_URL/jobs/$JOB_ID/apply" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
echo -e "${GREEN}✅ Applied: $(echo "$APPLY_RESP" | jq -r '.message // .error')${NC}"

# 4. Get Application ID from List (Simulating old method to find ID)
echo "4. Finding Application ID..."
LIST_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/applications/me")
APP_ID=$(echo "$LIST_RESP" | jq -r ".data[] | select(.job._id == \"$JOB_ID\") | ._id")

if [ -z "$APP_ID" ] || [ "$APP_ID" == "null" ]; then
    # Fallback: maybe the apply returned it
    APP_ID=$(echo "$APPLY_RESP" | jq -r '.data._id')
fi

if [ -z "$APP_ID" ] || [ "$APP_ID" == "null" ]; then
    echo -e "${RED}❌ Could not find application ID${NC}"
    echo "My Apps Response: $LIST_RESP"
    exit 1
fi
echo -e "${GREEN}✅ Application ID: $APP_ID${NC}"

# 5. Verify NEW ENDPOINT: Get Application By ID
echo "5. Testing GET /applications/$APP_ID (New Endpoint)..."
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/applications/$APP_ID")
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
    RETRIEVED_ID=$(echo "$RESPONSE" | jq -r '.data._id')
    if [ "$RETRIEVED_ID" == "$APP_ID" ]; then
        echo -e "${GREEN}🎉 SUCCESS: Successfully fetched application by ID!${NC}"
        echo "Exiting..."
        exit 0
    else
        echo -e "${RED}❌ Mismatch in ID${NC}"
        echo "Expected: $APP_ID"
        echo "Got: $RETRIEVED_ID"
        echo "Response: $RESPONSE"
        exit 1
    fi
else
    echo -e "${RED}❌ FAILED to get application by ID${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi
