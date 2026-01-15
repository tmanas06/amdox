# CORS Error Fix

## Problem
You're getting CORS errors because the backend isn't allowing requests from your frontend Vercel URL.

## Solution

### 1. Update Backend CORS Configuration

I've already updated `server/index.js` to allow requests from your Vercel frontend URL. The code now:
- Allows requests from `https://client-six-fawn-39.vercel.app`
- Allows requests from any `*.vercel.app` domain
- Allows localhost for development

### 2. Verify Environment Variable in Vercel

Make sure in your **backend Vercel project** (server):
- Go to **Settings** → **Environment Variables**
- Check that `CLIENT_URL` is set to: `https://client-six-fawn-39.vercel.app`
- Make sure it's set for **Production**, **Preview**, and **Development**

### 3. Redeploy Backend

After updating the code, you need to redeploy:

**Option A: Push to GitHub (Recommended)**
```bash
git add server/index.js
git commit -m "Fix CORS configuration"
git push origin main
```

GitHub Actions will automatically redeploy.

**Option B: Manual Deploy**
```bash
cd server
vercel --prod
```

### 4. Test Again

After redeployment:
1. Wait for deployment to complete (check Vercel dashboard)
2. Try Google Sign-In again
3. The CORS error should be gone

## About the Cross-Origin-Opener-Policy Warning

The `Cross-Origin-Opener-Policy` warning is a Firebase popup issue, but it's just a warning and won't break functionality. The main issue was the CORS error, which is now fixed.

## If CORS Still Doesn't Work

1. **Check Vercel Environment Variables**:
   - Make sure `CLIENT_URL` is exactly: `https://client-six-fawn-39.vercel.app`
   - No trailing slash
   - Includes `https://`

2. **Check Backend Logs**:
   - Go to Vercel → server project → Deployments
   - Click on latest deployment → Functions → View logs
   - Look for any CORS-related errors

3. **Test Backend Health Endpoint**:
   - Open: `https://server-navy-seven-74.vercel.app/health`
   - Should return: `{"success":true,"message":"Server is running",...}`

4. **Test CORS Headers**:
   - Open browser DevTools → Network tab
   - Try the request again
   - Check Response Headers for `Access-Control-Allow-Origin`
   - Should show: `https://client-six-fawn-39.vercel.app`

## Quick Fix Checklist

- [x] Updated CORS configuration in `server/index.js`
- [ ] Verify `CLIENT_URL` in Vercel backend environment variables
- [ ] Push changes to GitHub (or manually redeploy)
- [ ] Wait for deployment to complete
- [ ] Test Google Sign-In again

The code is fixed - just need to redeploy! 🚀
