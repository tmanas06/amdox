# Deployment Guide for AMDox

This guide covers deploying both the backend (Node.js/Express) and frontend (React) to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [MongoDB Atlas Setup](#mongodb-atlas-setup)
6. [Firebase Configuration](#firebase-configuration)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

- ✅ MongoDB Atlas account (already set up)
- ✅ Firebase project (already configured)
- ✅ Git repository (optional but recommended)
- ✅ Accounts for hosting platforms:
  - Backend: Heroku, Railway, Render, or AWS
  - Frontend: Vercel, Netlify, or AWS S3

---

## Backend Deployment

### Option 1: Railway (Recommended - Easy & Free Tier)

1. **Sign up**: Go to https://railway.app and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or "Empty Project" to deploy manually)

3. **Configure Project**:
   - If using GitHub: Connect your repo and select the `server` folder
   - If manual: Upload your `server` folder

4. **Set Environment Variables**:
   - Go to "Variables" tab
   - Add these variables:
     ```
     PORT=5000
     NODE_ENV=production
     MONGODB_URI=your-mongodb-atlas-connection-string
     JWT_SECRET=your-super-secret-jwt-key-min-32-characters
     JWT_EXPIRES_IN=7d
     CLIENT_URL=https://your-frontend-domain.com
     ```

5. **Deploy**:
   - Railway auto-detects Node.js projects
   - It will run `npm install` and `npm start`
   - Your backend will be live at: `https://your-project-name.up.railway.app`

6. **Get Your Backend URL**:
   - Copy the deployment URL (e.g., `https://amdox-backend.up.railway.app`)
   - Use this in your frontend `.env` file

---

### Option 2: Render (Free Tier Available)

1. **Sign up**: Go to https://render.com

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select the `server` folder

3. **Configure**:
   - **Name**: `amdox-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`

4. **Environment Variables**:
   - Add all variables from `.env` file

5. **Deploy**:
   - Click "Create Web Service"
   - Your backend will be at: `https://amdox-backend.onrender.com`

---

### Option 3: Heroku

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   cd server
   heroku create amdox-backend
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set JWT_EXPIRES_IN=7d
   heroku config:set CLIENT_URL=https://your-frontend-domain.com
   ```

5. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

---

### Option 4: AWS EC2 / DigitalOcean / VPS

1. **SSH into your server**

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone your repository**:
   ```bash
   git clone your-repo-url
   cd amdox/server
   ```

4. **Install dependencies**:
   ```bash
   npm install --production
   ```

5. **Set up environment variables**:
   ```bash
   nano .env
   # Add all your environment variables
   ```

6. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start index.js --name amdox-backend
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx reverse proxy** (optional):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended - Best for React)

1. **Sign up**: Go to https://vercel.com and sign up with GitHub

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select the `client` folder as root

3. **Configure Build Settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Environment Variables**:
   - Add these variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=your-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     REACT_APP_FIREBASE_APP_ID=your-app-id
     REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```

5. **Deploy**:
   - Click "Deploy"
   - Your frontend will be at: `https://your-project.vercel.app`

6. **Custom Domain** (optional):
   - Go to "Settings" → "Domains"
   - Add your custom domain

---

### Option 2: Netlify

1. **Sign up**: Go to https://www.netlify.com

2. **Deploy**:
   - Drag and drop your `client/build` folder, OR
   - Connect GitHub repo and set:
     - **Build command**: `cd client && npm install && npm run build`
     - **Publish directory**: `client/build`

3. **Environment Variables**:
   - Go to "Site settings" → "Environment variables"
   - Add all `REACT_APP_*` variables

4. **Deploy**: Your site will be at `https://your-site.netlify.app`

---

### Option 3: AWS S3 + CloudFront

1. **Build your React app**:
   ```bash
   cd client
   npm run build
   ```

2. **Upload to S3**:
   - Create S3 bucket
   - Enable static website hosting
   - Upload `build` folder contents

3. **Set up CloudFront**:
   - Create CloudFront distribution
   - Point to S3 bucket
   - Your site will be at CloudFront URL

---

## Environment Variables

### Backend (.env) - Production

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amdox?retryWrites=true&w=majority

# JWT Configuration (USE A STRONG SECRET!)
JWT_SECRET=your-super-secret-random-string-min-32-characters-long
JWT_EXPIRES_IN=7d

# CORS Configuration (your frontend URL)
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend (.env) - Production

```env
# API Configuration (your backend URL)
REACT_APP_API_URL=https://your-backend-domain.com/api

# Firebase Configuration (from Firebase Console)
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## MongoDB Atlas Setup for Production

1. **Network Access**:
   - Go to MongoDB Atlas → Network Access
   - Add your backend server's IP address
   - Or add `0.0.0.0/0` for development (NOT recommended for production)

2. **Database User**:
   - Create a dedicated database user for production
   - Use strong password
   - Give appropriate permissions

3. **Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add database name: `mongodb+srv://.../amdox?retryWrites=true&w=majority`

---

## Firebase Configuration for Production

1. **Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings
   - Add your production domain to "Authorized domains"
   - Example: `your-frontend-domain.com`

2. **OAuth Consent Screen** (if using Google Sign-In):
   - Go to Google Cloud Console
   - Configure OAuth consent screen
   - Add production domain to authorized domains

3. **Update Firebase Config**:
   - Your Firebase config in `client/src/firebase/config.js` should use environment variables
   - Make sure all `REACT_APP_FIREBASE_*` variables are set in your hosting platform

---

## Post-Deployment Checklist

### Backend ✅
- [ ] Backend is accessible at production URL
- [ ] Health check endpoint works: `GET /health`
- [ ] MongoDB connection is working
- [ ] Environment variables are set correctly
- [ ] CORS allows your frontend domain
- [ ] JWT_SECRET is strong and secure
- [ ] Server logs are accessible

### Frontend ✅
- [ ] Frontend is accessible at production URL
- [ ] All environment variables are set
- [ ] API calls point to production backend
- [ ] Firebase authentication works
- [ ] Google Sign-In works
- [ ] Email/password login works
- [ ] Protected routes work correctly

### Security ✅
- [ ] JWT_SECRET is not in code (use environment variables)
- [ ] MongoDB credentials are secure
- [ ] Firebase API keys are in environment variables
- [ ] HTTPS is enabled (most platforms do this automatically)
- [ ] CORS only allows your frontend domain
- [ ] MongoDB network access is restricted

### Testing ✅
- [ ] Test user registration
- [ ] Test Google Sign-In
- [ ] Test email/password login
- [ ] Test protected routes
- [ ] Test role detection (Gmail vs company email)
- [ ] Test API endpoints

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Make sure `CLIENT_URL` in backend matches your frontend domain exactly (including `https://`)

### Issue: Firebase Auth Not Working
**Solution**: 
- Add your domain to Firebase Authorized Domains
- Check Firebase environment variables are set correctly

### Issue: API Calls Failing
**Solution**:
- Verify `REACT_APP_API_URL` points to your backend
- Check backend CORS settings
- Check backend logs for errors

### Issue: MongoDB Connection Failed
**Solution**:
- Add your backend server IP to MongoDB Atlas Network Access
- Verify connection string is correct
- Check database user credentials

---

## Example Deployment URLs

After deployment, your URLs might look like:

- **Backend**: `https://amdox-backend.up.railway.app`
- **Frontend**: `https://amdox.vercel.app`

Update your environment variables accordingly:
- Backend `CLIENT_URL`: `https://amdox.vercel.app`
- Frontend `REACT_APP_API_URL`: `https://amdox-backend.up.railway.app/api`

---

## Quick Deploy Commands

### Build Frontend Locally (for testing)
```bash
cd client
npm run build
# Test the build locally
npx serve -s build
```

### Test Backend Locally (production mode)
```bash
cd server
NODE_ENV=production npm start
```

---

## Monitoring & Maintenance

1. **Monitor Logs**:
   - Backend: Check hosting platform logs
   - Frontend: Check browser console and hosting platform logs

2. **Database Backups**:
   - MongoDB Atlas provides automatic backups
   - Configure backup schedule in Atlas

3. **Update Dependencies**:
   - Regularly update npm packages
   - Check for security vulnerabilities: `npm audit`

4. **Performance**:
   - Monitor API response times
   - Use caching where appropriate
   - Optimize database queries

---

## Need Help?

- **Backend Issues**: Check server logs in your hosting platform
- **Frontend Issues**: Check browser console and network tab
- **Database Issues**: Check MongoDB Atlas logs
- **Firebase Issues**: Check Firebase Console logs

Good luck with your deployment! 🚀
