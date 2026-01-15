# Vercel + GitHub Actions Deployment Guide

This guide covers deploying both frontend and backend to Vercel using GitHub Actions for CI/CD.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Vercel Setup](#vercel-setup)
4. [GitHub Actions Setup](#github-actions-setup)
5. [Environment Variables](#environment-variables)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ GitHub account and repository
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ MongoDB Atlas account (already set up)
- ✅ Firebase project (already configured)

---

## Project Structure

For Vercel deployment, you have two options:

### Option 1: Separate Projects (Recommended)
- **Backend**: Deploy `server/` as a separate Vercel project
- **Frontend**: Deploy `client/` as a separate Vercel project

### Option 2: Monorepo (Single Project)
- Deploy both from root with `vercel.json` configuration

**We'll use Option 1 (Separate Projects)** as it's cleaner and easier to manage.

---

## Vercel Setup

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Create Backend Project

```bash
cd server
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name: `amdox-backend`
- Directory: `./`
- Override settings? **No**

This will create a `vercel.json` in the server directory.

### Step 4: Create Frontend Project

```bash
cd ../client
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name: `amdox-frontend`
- Directory: `./`
- Override settings? **No**

### Step 5: Link Projects to GitHub

1. Go to https://vercel.com/dashboard
2. Select your backend project (`amdox-backend`)
3. Go to **Settings** → **Git**
4. Connect your GitHub repository
5. Set **Root Directory** to `server`
6. Set **Build Command** to: (leave empty, Vercel auto-detects)
7. Set **Output Directory** to: (leave empty)
8. Set **Install Command** to: `npm install`

9. Repeat for frontend project:
   - Select `amdox-frontend`
   - Set **Root Directory** to `client`
   - Set **Build Command** to: `npm run build`
   - Set **Output Directory** to: `build`
   - Set **Install Command** to: `npm install`

---

## GitHub Actions Setup

### Step 1: Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name it: `github-actions-deploy`
4. Copy the token (you'll need it)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   - **Name**: `VERCEL_TOKEN`
     **Value**: (paste your Vercel token)

   - **Name**: `VERCEL_ORG_ID`
     **Value**: (get from Vercel dashboard → Settings → General)

   - **Name**: `VERCEL_PROJECT_ID_BACKEND`
     **Value**: (get from backend project settings)

   - **Name**: `VERCEL_PROJECT_ID_FRONTEND`
     **Value**: (get from frontend project settings)

### Step 3: Get Project IDs

**Backend Project ID:**
1. Go to Vercel dashboard
2. Select `amdox-backend` project
3. Go to **Settings** → **General**
4. Copy **Project ID**

**Frontend Project ID:**
1. Select `amdox-frontend` project
2. Go to **Settings** → **General**
3. Copy **Project ID**

### Step 4: Update GitHub Actions Workflow

The workflow files are already created in `.github/workflows/`. They will automatically:
- Run tests on push/PR
- Deploy to Vercel on merge to main/master

---

## Environment Variables

### Backend Environment Variables (Vercel)

1. Go to Vercel dashboard → `amdox-backend` project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/amdox?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://amdox-frontend.vercel.app
```

**Important**: 
- Set **Environment** to: `Production`, `Preview`, and `Development`
- Replace `CLIENT_URL` with your actual frontend Vercel URL

### Frontend Environment Variables (Vercel)

1. Go to Vercel dashboard → `amdox-frontend` project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
REACT_APP_API_URL = https://amdox-backend.vercel.app/api
REACT_APP_FIREBASE_API_KEY = AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 123456789
REACT_APP_FIREBASE_APP_ID = 1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID = G-XXXXXXXXXX
```

**Important**:
- Replace `REACT_APP_API_URL` with your actual backend Vercel URL
- Set **Environment** to: `Production`, `Preview`, and `Development`

---

## Deployment Process

### Automatic Deployment (via GitHub Actions)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **GitHub Actions will**:
   - Run CI tests
   - Build both projects
   - Deploy to Vercel automatically

3. **Check Deployment**:
   - Go to GitHub → **Actions** tab to see deployment progress
   - Go to Vercel dashboard to see deployment status

### Manual Deployment

**Backend:**
```bash
cd server
vercel --prod
```

**Frontend:**
```bash
cd client
vercel --prod
```

---

## Vercel Configuration Files

### Backend (`server/vercel.json`)

Already created. This tells Vercel how to handle your Node.js backend.

### Frontend (`client/vercel.json` - Optional)

Create if needed:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install"
}
```

---

## Custom Domains (Optional)

### Backend Domain

1. Go to Vercel → `amdox-backend` project
2. **Settings** → **Domains**
3. Add your domain: `api.yourdomain.com`
4. Follow DNS configuration instructions

### Frontend Domain

1. Go to Vercel → `amdox-frontend` project
2. **Settings** → **Domains**
3. Add your domain: `yourdomain.com` or `www.yourdomain.com`
4. Follow DNS configuration instructions

**Update Environment Variables** after adding domains:
- Backend `CLIENT_URL`: `https://yourdomain.com`
- Frontend `REACT_APP_API_URL`: `https://api.yourdomain.com/api`

---

## Firebase Configuration for Production

1. **Add Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domains:
     - `amdox-frontend.vercel.app`
     - `yourdomain.com` (if using custom domain)

2. **OAuth Consent Screen** (for Google Sign-In):
   - Go to Google Cloud Console
   - Add production domains to authorized domains

---

## MongoDB Atlas Configuration

1. **Network Access**:
   - Go to MongoDB Atlas → Network Access
   - Add Vercel serverless function IPs (or use `0.0.0.0/0` for development)
   - **For production**: Add specific IPs or use MongoDB Atlas IP whitelist

2. **Connection String**:
   - Make sure your `MONGODB_URI` in Vercel environment variables is correct
   - Include database name: `mongodb+srv://.../amdox?retryWrites=true&w=majority`

---

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push/PR:
- Tests backend code
- Builds frontend
- Validates code quality

### Deploy Workflow (`.github/workflows/deploy.yml`)

Runs on push to main/master:
- Deploys backend to Vercel
- Deploys frontend to Vercel
- Only runs on main/master branch

---

## Troubleshooting

### Issue: GitHub Actions Fails

**Check**:
- Vercel token is correct in GitHub Secrets
- Project IDs are correct
- Environment variables are set in Vercel

**Solution**:
```bash
# Test Vercel CLI locally
cd server
vercel login
vercel --prod
```

### Issue: Backend Not Deploying

**Check**:
- `server/vercel.json` exists
- `server/package.json` has `"main": "index.js"`
- Environment variables are set

**Solution**:
```bash
cd server
vercel logs
```

### Issue: Frontend Build Fails

**Check**:
- All `REACT_APP_*` environment variables are set
- Build command is correct: `npm run build`
- Output directory is `build`

**Solution**:
```bash
cd client
npm run build
# Test build locally
```

### Issue: CORS Errors

**Check**:
- Backend `CLIENT_URL` matches frontend URL exactly
- Includes `https://` protocol
- No trailing slash

**Solution**:
Update backend environment variable:
```
CLIENT_URL=https://amdox-frontend.vercel.app
```

### Issue: API Calls Failing

**Check**:
- Frontend `REACT_APP_API_URL` points to backend
- Backend is deployed and accessible
- Check Vercel function logs

**Solution**:
```bash
# Check backend logs
cd server
vercel logs
```

---

## Deployment Checklist

### Before First Deployment ✅
- [ ] Vercel account created
- [ ] Both projects created in Vercel
- [ ] Projects linked to GitHub
- [ ] Vercel token added to GitHub Secrets
- [ ] Project IDs added to GitHub Secrets
- [ ] Environment variables set in Vercel (both projects)
- [ ] MongoDB Atlas network access configured
- [ ] Firebase authorized domains updated

### After Deployment ✅
- [ ] Backend accessible at Vercel URL
- [ ] Frontend accessible at Vercel URL
- [ ] Health check works: `GET /health`
- [ ] API endpoints work
- [ ] Authentication works (Google Sign-In)
- [ ] Authentication works (Email/Password)
- [ ] CORS configured correctly
- [ ] GitHub Actions workflows running

---

## Quick Commands Reference

```bash
# Login to Vercel
vercel login

# Deploy backend
cd server
vercel --prod

# Deploy frontend
cd client
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls

# Remove deployment
vercel remove
```

---

## URLs After Deployment

Your deployed applications will be at:

- **Backend**: `https://amdox-backend.vercel.app`
- **Frontend**: `https://amdox-frontend.vercel.app`

Update environment variables with these URLs:
- Backend `CLIENT_URL`: `https://amdox-frontend.vercel.app`
- Frontend `REACT_APP_API_URL`: `https://amdox-backend.vercel.app/api`

---

## Next Steps

1. **Push to GitHub**: Your first push will trigger deployment
2. **Monitor**: Check GitHub Actions and Vercel dashboard
3. **Test**: Verify all features work in production
4. **Custom Domain**: Add your own domain (optional)

Good luck with your deployment! 🚀
