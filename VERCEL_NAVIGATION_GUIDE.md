# Vercel Navigation Guide - Where to Find Everything

Based on your current Vercel dashboard view, here's exactly where to find each page you need.

## Current Location
You're currently at: **Vercel Dashboard → Overview** (`https://vercel.com/tmanas06s-projects`)

---

## 1. Get Vercel Token

### Path to Tokens Page:

**Option A: From Profile Menu**
1. Click your **profile icon** (top right corner - your avatar)
2. Click **"Settings"** from the dropdown menu
3. In the left sidebar, click **"Tokens"**
4. URL will be: `https://vercel.com/account/tokens`

**Option B: Direct URL**
- Go directly to: https://vercel.com/account/tokens

**What to do there:**
- Click **"Create Token"** button
- Name it: `github-actions-deploy`
- Click **"Create"**
- **Copy the token immediately** (you won't see it again!)

---

## 2. Get Organization ID

### Path to Organization Settings:

**Option A: From Organization Name**
1. Click **"tmanas06's projects"** (top left, next to the Vercel logo)
2. Click **"Settings"** from the dropdown
3. You'll be at: `https://vercel.com/tmanas06s-projects/settings`
4. In the left sidebar, make sure **"General"** is selected
5. Scroll down to find **"Organization ID"**
   - It looks like: `team_xxxxxxxxxxxxxxxxxxxx`

**Option B: Direct Navigation**
- From your current page, click the organization name in the top left
- Then click "Settings"
- Look for "Organization ID" in the General tab

---

## 3. Get Server Project ID

### Path to Server Project Settings:

**From Current Dashboard:**
1. Click on the **"server"** project card (you can see it in your projects grid)
2. You'll be taken to the server project page
3. Click the **"Settings"** tab (top navigation bar)
4. In the left sidebar, make sure **"General"** is selected
5. Scroll down to find **"Project ID"**
   - It looks like: `prj_xxxxxxxxxxxxxxxxxxxx`
   - This is your `VERCEL_PROJECT_ID_BACKEND`

**Alternative:**
- Click the three dots (⋯) on the server project card
- Select **"Settings"**
- Go to **"General"** tab
- Find **"Project ID"**

---

## 4. Get Client Project ID

### Path to Client Project Settings:

**From Current Dashboard:**
1. Click on the **"client"** project card (you can see it in your projects grid)
2. You'll be taken to the client project page
3. Click the **"Settings"** tab (top navigation bar)
4. In the left sidebar, make sure **"General"** is selected
5. Scroll down to find **"Project ID"**
   - It looks like: `prj_xxxxxxxxxxxxxxxxxxxx`
   - This is your `VERCEL_PROJECT_ID_FRONTEND`

**Alternative:**
- Click the three dots (⋯) on the client project card
- Select **"Settings"**
- Go to **"General"** tab
- Find **"Project ID"**

---

## 5. Connect Projects to GitHub (Optional)

### For Server Project:

1. Click on **"server"** project card
2. Click **"Settings"** tab
3. Click **"Git"** in the left sidebar
4. Click **"Connect Git Repository"** button
5. Select **GitHub**
6. Authorize if prompted
7. Select your repository: `tmanas06/amdox` (or your repo name)
8. Set **Root Directory** to: `server`
9. Click **"Connect"**

### For Client Project:

1. Click on **"client"** project card
2. Click **"Settings"** tab
3. Click **"Git"** in the left sidebar
4. Click **"Connect Git Repository"** button
5. Select **GitHub**
6. Select your repository: `tmanas06/amdox` (or your repo name)
7. Set **Root Directory** to: `client`
8. Click **"Connect"**

---

## Visual Navigation Map

```
Vercel Dashboard (Current Location)
│
├── Profile Icon (top right)
│   └── Settings
│       └── Tokens ← Get VERCEL_TOKEN here
│
├── Organization Name (top left: "tmanas06's projects")
│   └── Settings
│       └── General ← Get VERCEL_ORG_ID here
│
├── server project card
│   └── Click card → Settings → General ← Get VERCEL_PROJECT_ID_BACKEND here
│   └── Settings → Git ← Connect to GitHub here
│
└── client project card
    └── Click card → Settings → General ← Get VERCEL_PROJECT_ID_FRONTEND here
    └── Settings → Git ← Connect to GitHub here
```

---

## Quick Reference URLs

Once you know your organization and project names, you can use these direct URLs:

- **Tokens**: https://vercel.com/account/tokens
- **Organization Settings**: https://vercel.com/tmanas06s-projects/settings
- **Server Project**: https://vercel.com/tmanas06s-projects/server
- **Server Settings**: https://vercel.com/tmanas06s-projects/server/settings
- **Client Project**: https://vercel.com/tmanas06s-projects/client
- **Client Settings**: https://vercel.com/tmanas06s-projects/client/settings

---

## Step-by-Step Checklist

### Step 1: Get Token
- [ ] Click profile icon (top right)
- [ ] Click "Settings"
- [ ] Click "Tokens" in left sidebar
- [ ] Click "Create Token"
- [ ] Name: `github-actions-deploy`
- [ ] Copy token immediately

### Step 2: Get Org ID
- [ ] Click "tmanas06's projects" (top left)
- [ ] Click "Settings"
- [ ] Go to "General" tab
- [ ] Find "Organization ID"
- [ ] Copy the ID (starts with `team_`)

### Step 3: Get Server Project ID
- [ ] Click "server" project card
- [ ] Click "Settings" tab
- [ ] Go to "General" tab
- [ ] Find "Project ID"
- [ ] Copy the ID (starts with `prj_`)

### Step 4: Get Client Project ID
- [ ] Click "client" project card
- [ ] Click "Settings" tab
- [ ] Go to "General" tab
- [ ] Find "Project ID"
- [ ] Copy the ID (starts with `prj_`)

### Step 5: Add to GitHub
- [ ] Go to GitHub repository
- [ ] Settings → Secrets → Actions
- [ ] Add all 4 secrets

---

## Tips

1. **Organization ID**: If you can't find it, check the URL when you're in organization settings - it might be in the path
2. **Project ID**: It's usually near the bottom of the General settings page
3. **Token**: Create it fresh - don't reuse old tokens
4. **Bookmark**: Bookmark the Tokens page for easy access later

---

## Troubleshooting

**Can't find Organization ID?**
- Make sure you clicked on the organization name, not a project
- Check if you're in a team vs personal account
- The ID should be visible in the General tab

**Can't find Project ID?**
- Make sure you're in the project's Settings, not the Overview
- Scroll down in the General tab - it's usually at the bottom
- It should be labeled clearly as "Project ID"

**Token page not loading?**
- Make sure you're logged in
- Try refreshing the page
- Check your internet connection

---

You're all set! Follow these paths to find everything you need. 🚀
