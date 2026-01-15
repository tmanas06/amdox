# Troubleshooting 500 Internal Server Error

## Problem
Backend is returning 500 error when trying to authenticate with Firebase.

## Common Causes

### 1. MongoDB Connection Issue
The backend might not be connecting to MongoDB properly.

**Check:**
- MongoDB URI in Vercel environment variables
- MongoDB network access allows Vercel IPs
- Database credentials are correct

### 2. Missing Environment Variables
Required environment variables might not be set in Vercel.

**Required variables:**
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`

### 3. Error in Code
There might be an error in the authentication controller.

## How to Debug

### Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard → server project
2. Click on **"Deployments"** tab
3. Click on the latest deployment
4. Click on **"Functions"** tab
5. Click on the function (usually `index.js`)
6. Check **"Logs"** tab
7. Look for error messages

### Step 2: Test Backend Health Endpoint

Open in browser:
```
https://server-navy-seven-74.vercel.app/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

If this fails, the backend isn't deploying correctly.

### Step 3: Check Environment Variables

In Vercel → server project → Settings → Environment Variables:

Verify these are set:
- ✅ `MONGODB_URI` = `mongodb+srv://2210030003cse_db_user:e87S4CnDur7EICEw@amdox-cluster.yaoykps.mongodb.net/amdox?retryWrites=true&w=majority`
- ✅ `JWT_SECRET` = (your secret)
- ✅ `JWT_EXPIRES_IN` = `7d`
- ✅ `CLIENT_URL` = `https://client-six-fawn-39.vercel.app`
- ✅ `NODE_ENV` = `production`

### Step 4: Check MongoDB Connection

1. Go to MongoDB Atlas
2. Check **Network Access**
3. Make sure `0.0.0.0/0` is allowed (or Vercel IPs)
4. Test connection string in MongoDB Compass

### Step 5: Add Error Logging

The backend should log errors. Check Vercel function logs for:
- MongoDB connection errors
- JWT errors
- Validation errors
- Any stack traces

## Quick Fixes

### Fix 1: Verify MongoDB URI Format

Make sure the MongoDB URI in Vercel is exactly:
```
mongodb+srv://2210030003cse_db_user:e87S4CnDur7EICEw@amdox-cluster.yaoykps.mongodb.net/amdox?retryWrites=true&w=majority
```

### Fix 2: Check MongoDB Network Access

In MongoDB Atlas:
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Or add Vercel's IP ranges

### Fix 3: Redeploy Backend

After fixing environment variables:
1. Go to Vercel → server project
2. Click **"Deployments"**
3. Click three dots on latest deployment
4. Click **"Redeploy"**

Or push to GitHub:
```bash
git push origin main
```

## Expected Behavior

When working correctly:
1. Frontend sends Firebase user data to backend
2. Backend connects to MongoDB
3. Backend creates/updates user
4. Backend generates JWT token
5. Backend returns token and user data
6. Frontend stores token and updates state

## Next Steps

1. Check Vercel function logs (most important!)
2. Verify all environment variables are set
3. Test MongoDB connection
4. Redeploy if needed
5. Test again

The logs will tell us exactly what's wrong! 🔍
