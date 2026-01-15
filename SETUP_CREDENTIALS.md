# Setup Credentials - Step by Step

You have all your credentials! Now let's add them to the right places.

## ✅ What You Have

- ✅ MongoDB Username & Password
- ✅ Vercel Token
- ✅ Organization ID
- ✅ Client Project ID
- ✅ Server Project ID

---

## Step 1: Add GitHub Secrets

### Go to GitHub Repository

1. Open your GitHub repository: `https://github.com/tmanas06/amdox` (or your repo URL)
2. Click **"Settings"** tab (top navigation)
3. Click **"Secrets and variables"** → **"Actions"** (left sidebar)

### Add These 4 Secrets

Click **"New repository secret"** for each:

#### Secret 1: VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Secret**: `zGILMCQdiLcBvABDLQfToTd3`
- Click **"Add secret"**

#### Secret 2: VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`
- **Secret**: `team_StA2qGk89L79Dizg6aeDMy8i`
- Click **"Add secret"**

#### Secret 3: VERCEL_PROJECT_ID_BACKEND
- **Name**: `VERCEL_PROJECT_ID_BACKEND`
- **Secret**: `prj_WTkU170Z3jat9RCjuQUNEbB0G8I9`
- Click **"Add secret"**

#### Secret 4: VERCEL_PROJECT_ID_FRONTEND
- **Name**: `VERCEL_PROJECT_ID_FRONTEND`
- **Secret**: `prj_XgN0eCBXpYpVE0z1JAVeA0Qhrhq5`
- Click **"Add secret"**

### Verify All Secrets Added

You should now see:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID_BACKEND`
- ✅ `VERCEL_PROJECT_ID_FRONTEND`

---

## Step 2: Set Environment Variables in Vercel

### Backend (Server) Project Environment Variables

1. **Go to Server Project**:
   - Click on **"server"** project in Vercel dashboard
   - Or go to: https://vercel.com/tmanas06s-projects/server

2. **Go to Settings → Environment Variables**:
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

3. **Add These Variables** (click "Add" for each):

   **Variable 1:**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 2:**
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://2210030003cse_db_user:e87S4CnDur7EICEw@amdox-cluster.yaoykps.mongodb.net/amdox?retryWrites=true&w=majority`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 3:**
   - **Key**: `JWT_SECRET`
   - **Value**: `your-super-secret-jwt-key-change-this-to-something-random-and-long`
   - ⚠️ **IMPORTANT**: Replace this with a strong random string (at least 32 characters)
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 4:**
   - **Key**: `JWT_EXPIRES_IN`
   - **Value**: `7d`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 5:**
   - **Key**: `CLIENT_URL`
   - **Value**: `https://client-six-fawn-39.vercel.app`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

### Frontend (Client) Project Environment Variables

1. **Go to Client Project**:
   - Click on **"client"** project in Vercel dashboard
   - Or go to: https://vercel.com/tmanas06s-projects/client

2. **Go to Settings → Environment Variables**:
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

3. **Add These Variables** (click "Add" for each):

   **Variable 1:**
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://server-navy-seven-74.vercel.app/api`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 2:**
   - **Key**: `REACT_APP_FIREBASE_API_KEY`
   - **Value**: `AIzaSyC0mapz7fR6aY_OxwnRX31RYWiDQyqsTBs`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 3:**
   - **Key**: `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - **Value**: `amdox-f2995.firebaseapp.com`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 4:**
   - **Key**: `REACT_APP_FIREBASE_PROJECT_ID`
   - **Value**: `amdox-f2995`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 5:**
   - **Key**: `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - **Value**: `amdox-f2995.firebasestorage.app`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 6:**
   - **Key**: `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - **Value**: `432230585932`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 7:**
   - **Key**: `REACT_APP_FIREBASE_APP_ID`
   - **Value**: `1:432230585932:web:7d2620e27d4469496906e9`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 8:**
   - **Key**: `REACT_APP_FIREBASE_MEASUREMENT_ID`
   - **Value**: `G-DCPYYNX5BN`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

---

## Step 3: Generate a Strong JWT Secret

You need to replace the JWT_SECRET with a strong random string. Here are options:

### Option A: Use Online Generator
- Go to: https://randomkeygen.com/
- Copy a "CodeIgniter Encryption Keys" (64 characters)
- Use that as your JWT_SECRET

### Option B: Generate in Terminal
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option C: Use This (Quick but less secure)
- Use: `amdox-jwt-secret-2024-production-key-change-this-later`

**⚠️ Important**: For production, use a truly random string!

---

## Step 4: Update Firebase Authorized Domains

1. **Go to Firebase Console**:
   - https://console.firebase.google.com/
   - Select your project: `amdox-f2995`

2. **Add Authorized Domains**:
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Click **"Add domain"**
   - Add: `client-six-fawn-39.vercel.app`
   - Add: `server-navy-seven-74.vercel.app`
   - Click **"Add"** for each

---

## Step 5: Verify MongoDB Network Access

1. **Go to MongoDB Atlas**:
   - https://cloud.mongodb.com/
   - Select your cluster

2. **Check Network Access**:
   - Go to **Network Access**
   - Make sure `0.0.0.0/0` is allowed (for development)
   - Or add Vercel's IP ranges (for production)

---

## Verification Checklist

### GitHub Secrets ✅
- [ ] `VERCEL_TOKEN` added
- [ ] `VERCEL_ORG_ID` added
- [ ] `VERCEL_PROJECT_ID_BACKEND` added
- [ ] `VERCEL_PROJECT_ID_FRONTEND` added

### Backend Environment Variables ✅
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` (with your credentials)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `CLIENT_URL` (frontend Vercel URL)

### Frontend Environment Variables ✅
- [ ] `REACT_APP_API_URL` (backend Vercel URL)
- [ ] All Firebase variables added
- [ ] All set for Production, Preview, and Development

### Firebase ✅
- [ ] Authorized domains added

### MongoDB ✅
- [ ] Network access configured

---

## Next Steps

After completing all steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Watch GitHub Actions**:
   - Go to GitHub → Your repo → **"Actions"** tab
   - You should see the deployment workflow running

3. **Check Vercel Dashboard**:
   - Both projects should deploy automatically
   - Check deployment logs if there are any errors

4. **Test Your Deployment**:
   - Backend: `https://server-navy-seven-74.vercel.app/health`
   - Frontend: `https://client-six-fawn-39.vercel.app`
   - Test authentication
   - Test API calls

---

## Security Reminders

⚠️ **Important**:
- Never commit these credentials to your code
- Never share your Vercel token publicly
- Use a strong JWT_SECRET (at least 32 characters, random)
- Consider rotating secrets periodically
- MongoDB password is sensitive - keep it secure

---

You're almost ready to deploy! Complete these steps and push to GitHub. 🚀
