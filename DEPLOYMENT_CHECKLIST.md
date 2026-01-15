# Deployment Checklist

## ✅ Pre-Deployment Verification

### File Structure
- [x] `server/vercel.json` - Backend Vercel configuration
- [x] `client/vercel.json` - Frontend Vercel configuration
- [x] `.github/workflows/deploy.yml` - GitHub Actions deployment workflow
- [x] `.github/workflows/ci.yml` - GitHub Actions CI workflow
- [x] `server/index.js` - Exports app correctly for Vercel
- [x] `server/package.json` - Has correct start script
- [x] `client/package.json` - Has correct build script

### Configuration Files
- [x] Backend vercel.json is valid JSON
- [x] Frontend vercel.json is valid JSON
- [x] GitHub Actions workflow has both backend and frontend jobs
- [x] Server exports app for Vercel serverless

## 🔧 Setup Steps (One-Time)

### 1. Vercel Setup
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Create backend project: `cd server && vercel`
- [ ] Create frontend project: `cd client && vercel`
- [ ] Note down project URLs from Vercel dashboard

### 2. Get Vercel Credentials
- [ ] Get Vercel Token: https://vercel.com/account/tokens
- [ ] Get Org ID: Vercel Dashboard → Settings → General
- [ ] Get Backend Project ID: Backend project → Settings → General
- [ ] Get Frontend Project ID: Frontend project → Settings → General

### 3. GitHub Secrets Setup
Go to GitHub → Repository → Settings → Secrets → Actions

Add these secrets:
- [ ] `VERCEL_TOKEN` - Your Vercel API token
- [ ] `VERCEL_ORG_ID` - Your Vercel organization ID
- [ ] `VERCEL_PROJECT_ID_BACKEND` - Backend project ID
- [ ] `VERCEL_PROJECT_ID_FRONTEND` - Frontend project ID

### 4. Environment Variables in Vercel

**Backend Project** (Vercel Dashboard → Backend Project → Settings → Environment Variables):
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=your-mongodb-connection-string`
- [ ] `JWT_SECRET=your-secret-key-min-32-chars`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `CLIENT_URL=https://your-frontend-url.vercel.app`

**Frontend Project** (Vercel Dashboard → Frontend Project → Settings → Environment Variables):
- [ ] `REACT_APP_API_URL=https://your-backend-url.vercel.app/api`
- [ ] `REACT_APP_FIREBASE_API_KEY=your-firebase-key`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID=your-project-id`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id`
- [ ] `REACT_APP_FIREBASE_APP_ID=your-app-id`
- [ ] `REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id`

**Important**: Set environment for all: Production, Preview, and Development

### 5. Firebase Configuration
- [ ] Add backend Vercel URL to Firebase Authorized Domains
- [ ] Add frontend Vercel URL to Firebase Authorized Domains
- [ ] Update OAuth consent screen with production domains

### 6. MongoDB Atlas Configuration
- [ ] Add Vercel serverless function IPs to Network Access
- [ ] Or use `0.0.0.0/0` for development (NOT recommended for production)
- [ ] Verify connection string includes database name

## 🚀 Deployment

### First Deployment
- [ ] Push code to GitHub: `git push origin main`
- [ ] Check GitHub Actions tab for deployment progress
- [ ] Verify both backend and frontend deploy successfully
- [ ] Check Vercel dashboard for deployment status

### Verify Deployment
- [ ] Backend health check: `GET https://your-backend.vercel.app/health`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Test Google Sign-In
- [ ] Test email/password login
- [ ] Test API endpoints
- [ ] Check CORS is working (no CORS errors in browser console)

## 🐛 Troubleshooting

### If GitHub Actions Fails
1. Check Vercel token is correct
2. Verify project IDs are correct
3. Check workflow logs in GitHub Actions tab

### If Backend Doesn't Deploy
1. Check `server/vercel.json` is valid
2. Verify environment variables are set
3. Check Vercel function logs

### If Frontend Doesn't Deploy
1. Check `client/vercel.json` is valid
2. Verify build command works locally: `cd client && npm run build`
3. Check all `REACT_APP_*` environment variables are set

### If CORS Errors
1. Verify `CLIENT_URL` in backend matches frontend URL exactly
2. Include `https://` protocol
3. No trailing slash

## 📝 Post-Deployment

- [ ] Update README with production URLs
- [ ] Test all authentication flows
- [ ] Monitor Vercel logs for errors
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts (optional)

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Backend responds at Vercel URL
- ✅ Frontend loads at Vercel URL
- ✅ Authentication works (Google + Email/Password)
- ✅ API calls succeed
- ✅ No CORS errors
- ✅ Database connections work
- ✅ GitHub Actions deploys automatically on push
