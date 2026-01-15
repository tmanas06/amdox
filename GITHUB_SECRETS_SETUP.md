# Step 2: GitHub Secrets Setup Guide

Now that you have both Vercel projects created, you need to get credentials and add them to GitHub Secrets for automatic deployment.

## Your Vercel Projects

Based on your Vercel dashboard:
- **Client Project**: `client-six-fawn-39.vercel.app`
- **Server Project**: `server-navy-seven-74.vercel.app`

---

## Part 1: Get Vercel Token

1. **Go to Vercel Account Settings**:
   - Click on your profile icon (top right in Vercel dashboard)
   - Select **"Settings"** from the dropdown

2. **Navigate to Tokens**:
   - In the left sidebar, click **"Tokens"**
   - Or go directly to: https://vercel.com/account/tokens

3. **Create New Token**:
   - Click the **"Create Token"** button
   - **Name**: `github-actions-deploy` (or any name you prefer)
   - **Scope**: Leave as default (Full Account Access)
   - Click **"Create"**

4. **Copy the Token**:
   - ⚠️ **IMPORTANT**: Copy the token immediately - you won't be able to see it again!
   - It will look like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe (you'll need it in Part 4)

---

## Part 2: Get Organization ID

1. **Go to Vercel Dashboard**:
   - Make sure you're on the main dashboard (https://vercel.com/dashboard)

2. **Open Organization Settings**:
   - Click on your organization name (top left, next to "Projects")
   - Select **"Settings"** from the dropdown
   - Or go to: https://vercel.com/[your-org]/settings

3. **Find Organization ID**:
   - In the **"General"** tab, scroll down
   - Look for **"Organization ID"**
   - It will look like: `team_xxxxxxxxxxxxxxxxxxxx`
   - Copy this ID

**Alternative Method**:
- If you can't find it in settings, you can also get it from the URL when you're in organization settings
- Or check the browser's developer tools Network tab when loading the dashboard

---

## Part 3: Get Project IDs

You need to get the Project ID for both your client and server projects.

### Get Backend (Server) Project ID

1. **Open Server Project**:
   - Click on the **"server"** project card in your Vercel dashboard
   - Or go to: https://vercel.com/[your-org]/server

2. **Go to Project Settings**:
   - Click **"Settings"** tab (top navigation)
   - Or click the three dots (⋯) on the project card → **"Settings"**

3. **Find Project ID**:
   - In the **"General"** section
   - Look for **"Project ID"**
   - It will look like: `prj_xxxxxxxxxxxxxxxxxxxx`
   - Copy this ID - this is your **`VERCEL_PROJECT_ID_BACKEND`**

### Get Frontend (Client) Project ID

1. **Open Client Project**:
   - Click on the **"client"** project card in your Vercel dashboard
   - Or go to: https://vercel.com/[your-org]/client

2. **Go to Project Settings**:
   - Click **"Settings"** tab (top navigation)
   - Or click the three dots (⋯) on the project card → **"Settings"**

3. **Find Project ID**:
   - In the **"General"** section
   - Look for **"Project ID"**
   - It will look like: `prj_xxxxxxxxxxxxxxxxxxxx`
   - Copy this ID - this is your **`VERCEL_PROJECT_ID_FRONTEND`**

---

## Part 4: Add GitHub Secrets

Now you'll add all these credentials to your GitHub repository.

### Step 1: Open GitHub Repository Settings

1. **Go to your GitHub repository**:
   - Navigate to: `https://github.com/[your-username]/amdox`
   - Or your repository URL

2. **Open Settings**:
   - Click the **"Settings"** tab (top navigation)
   - Make sure you have admin access to the repository

3. **Navigate to Secrets**:
   - In the left sidebar, click **"Secrets and variables"**
   - Then click **"Actions"**

### Step 2: Add Each Secret

Click **"New repository secret"** for each of the following:

#### Secret 1: VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Secret**: (paste the token you copied in Part 1)
- Click **"Add secret"**

#### Secret 2: VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`
- **Secret**: (paste the Organization ID from Part 2)
- Click **"Add secret"**

#### Secret 3: VERCEL_PROJECT_ID_BACKEND
- **Name**: `VERCEL_PROJECT_ID_BACKEND`
- **Secret**: (paste the Server Project ID from Part 3)
- Click **"Add secret"**

#### Secret 4: VERCEL_PROJECT_ID_FRONTEND
- **Name**: `VERCEL_PROJECT_ID_FRONTEND`
- **Secret**: (paste the Client Project ID from Part 3)
- Click **"Add secret"**

### Step 3: Verify Secrets

After adding all secrets, you should see:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID_BACKEND`
- ✅ `VERCEL_PROJECT_ID_FRONTEND`

---

## Part 5: Connect Projects to GitHub (Optional but Recommended)

While you're in the Vercel dashboard, you can connect your projects to GitHub for easier management.

### Connect Server Project to GitHub

1. **Open Server Project**:
   - Click on the **"server"** project card

2. **Go to Settings → Git**:
   - Click **"Settings"** tab
   - Click **"Git"** in the left sidebar

3. **Connect Repository**:
   - Click **"Connect Git Repository"**
   - Select **GitHub**
   - Authorize Vercel if prompted
   - Select your repository: `[your-username]/amdox`
   - **Root Directory**: Select `server` from dropdown
   - Click **"Connect"**

4. **Configure Build Settings**:
   - **Framework Preset**: Other (or leave auto-detected)
   - **Root Directory**: `server`
   - **Build Command**: (leave empty - Vercel will auto-detect)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`
   - Click **"Save"**

### Connect Client Project to GitHub

1. **Open Client Project**:
   - Click on the **"client"** project card

2. **Go to Settings → Git**:
   - Click **"Settings"** tab
   - Click **"Git"** in the left sidebar

3. **Connect Repository**:
   - Click **"Connect Git Repository"**
   - Select **GitHub**
   - Select your repository: `[your-username]/amdox`
   - **Root Directory**: Select `client` from dropdown
   - Click **"Connect"**

4. **Configure Build Settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
   - Click **"Save"**

---

## Verification Checklist

After completing all steps, verify:

- [ ] Vercel token created and copied
- [ ] Organization ID found and copied
- [ ] Server Project ID found and copied
- [ ] Client Project ID found and copied
- [ ] All 4 secrets added to GitHub
- [ ] Server project connected to GitHub (optional)
- [ ] Client project connected to GitHub (optional)

---

## Quick Reference: Where to Find Everything

| What You Need | Where to Find It |
|--------------|------------------|
| **Vercel Token** | Vercel Dashboard → Profile → Settings → Tokens → Create Token |
| **Org ID** | Vercel Dashboard → Organization → Settings → General → Organization ID |
| **Server Project ID** | Vercel Dashboard → server project → Settings → General → Project ID |
| **Client Project ID** | Vercel Dashboard → client project → Settings → General → Project ID |
| **GitHub Secrets** | GitHub Repository → Settings → Secrets and variables → Actions |

---

## Troubleshooting

### Can't Find Organization ID
- Try clicking on your organization name in the top left
- Check the URL when in organization settings
- It might be in the format: `team_xxxxxxxxxxxxxxxxxxxx`

### Can't Find Project ID
- Make sure you're in the project's Settings → General tab
- Scroll down if you don't see it immediately
- It should be in the format: `prj_xxxxxxxxxxxxxxxxxxxx`

### GitHub Secrets Not Saving
- Make sure you have admin/write access to the repository
- Check that you're in the correct repository
- Try refreshing the page and adding again

### Token Not Working
- Make sure you copied the entire token (no spaces)
- Tokens are case-sensitive
- If it doesn't work, create a new token and try again

---

## Next Steps

After completing Step 2, proceed to:
- **Step 3**: Set Environment Variables in Vercel (for both projects)
- **Step 4**: Configure Firebase and MongoDB for production
- **Step 5**: Push to GitHub and watch automatic deployment!

---

## Security Notes

⚠️ **Important Security Reminders**:
- Never commit tokens or secrets to your code
- Never share your Vercel token publicly
- If a token is compromised, revoke it immediately and create a new one
- GitHub Secrets are encrypted and only accessible to workflows

---

Good luck! Once you complete this step, your GitHub Actions will be able to automatically deploy to Vercel. 🚀
