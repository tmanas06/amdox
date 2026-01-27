#!/bin/bash

echo "Starting Chat Verification..."

# 1. Login & Get Token
TOKEN=$(curl -s http://localhost:5005/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"testcheckmmm@gmail.com","password":"Cyber@123"}' | jq -r '.token')
if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login FAILED"
  exit 1
fi
echo "✅ Token obtained"

# 2. Get a Job ID
JOB_ID=$(curl -s http://localhost:5005/api/jobs | jq -r '.data[0]._id')
if [ -z "$JOB_ID" ] || [ "$JOB_ID" == "null" ]; then
  echo "❌ Failed to get Job ID"
  exit 1
fi
echo "✅ Job ID: $JOB_ID"

# 3. Apply to Job (ignore if already applied)
curl -s -X POST "http://localhost:5005/api/jobs/$JOB_ID/apply" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' > /dev/null
echo "✅ Applied to job (or already applied)"

# 4. Get Application ID
APP_ID=$(curl -s -X GET "http://localhost:5005/api/applications/me" -H "Authorization: Bearer $TOKEN" | jq -r ".data[] | select(.job._id == \"$JOB_ID\") | ._id")
if [ -z "$APP_ID" ] || [ "$APP_ID" == "null" ]; then
  echo "❌ Failed to get Application ID"
  exit 1
fi
echo "✅ Application ID: $APP_ID"

# 5. Send Message using applications endpoint (Client uses this)
MSG_CONTENT="Verifying Chat Fix $(date +%s)"
curl -s -X POST "http://localhost:5005/api/applications/$APP_ID/messages" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"content\": \"$MSG_CONTENT\"}" > /dev/null
echo "✅ Message sent: $MSG_CONTENT"

# 6. Verify Message Persistence via messages endpoint
MESSAGES=$(curl -s -X GET "http://localhost:5005/api/messages/application/$APP_ID" -H "Authorization: Bearer $TOKEN")
FOUND=$(echo "$MESSAGES" | grep "$MSG_CONTENT")

if [ -n "$FOUND" ]; then
  echo "🎉 VERIFICATION SUCCESS: Message found in history!"
  echo "Message Data: $MESSAGES"
else
  echo "❌ VERIFICATION FAILED: Message not found."
  echo "All Messages: $MESSAGES"
  exit 1
fi
