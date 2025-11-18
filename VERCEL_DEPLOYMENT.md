# Vercel Deployment Guide - Fixing Admin Login Issues

## 🔴 Critical: Environment Variables Required

Your admin login is failing because **required environment variables are missing** on Vercel. The "message port closed" errors you're seeing are from browser extensions and can be ignored - they're not the real issue.

## Required Environment Variables

You **MUST** set these environment variables in your Vercel project settings:

### 1. NextAuth Configuration (REQUIRED for login)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXTAUTH_SECRET=<generate-a-random-secret-here>
NEXTAUTH_URL=https://namibian-football-xjv7.vercel.app
```

**To generate NEXTAUTH_SECRET:**
- Visit: https://generate-secret.vercel.app/32
- Or run: `openssl rand -base64 32` in your terminal
- Copy the generated string and paste it as the value

**Important:** 
- `NEXTAUTH_URL` must match your exact Vercel domain (including `https://`)
- If you have a custom domain, use that instead

### 2. Firebase Configuration (REQUIRED for database)

Add all these Firebase environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id (optional)
```

**To get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **General**
4. Scroll to **Your apps** section
5. Click on your web app (or create one if needed)
6. Copy the `firebaseConfig` values

## Step-by-Step Setup Instructions

### Step 1: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `namibian-football-xjv7`

2. **Navigate to Environment Variables**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name (e.g., `NEXTAUTH_SECRET`)
   - Enter the value
   - Select environments: **Production**, **Preview**, and **Development** (or at least Production)
   - Click **Save**
   - Repeat for each variable

### Step 2: Redeploy Your Application

After adding all environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Important:** Environment variables are only available after a new deployment!

### Step 3: Verify the Setup

1. Wait for the deployment to complete
2. Visit: https://namibian-football-xjv7.vercel.app/admin/login
3. Try logging in with your admin credentials
4. Check the browser console (F12) for any errors

## Troubleshooting

### Still Can't Login?

1. **Check Vercel Logs**
   - Go to **Deployments** → Click on your deployment → **Functions** tab
   - Look for errors in the `/api/auth/[...nextauth]` function
   - Common errors:
     - `NEXTAUTH_SECRET is missing` → You forgot to add it
     - `Invalid NEXTAUTH_URL` → URL doesn't match your domain

2. **Verify Environment Variables**
   - In Vercel, go to **Settings** → **Environment Variables**
   - Make sure all variables are set for **Production** environment
   - Check for typos in variable names (case-sensitive!)

3. **Check Firebase Connection**
   - Open browser console (F12)
   - Look for Firebase initialization errors
   - If you see "Firebase configuration is incomplete", your Firebase env vars are missing

4. **Test with Browser DevTools**
   - Open Network tab
   - Try to login
   - Check the `/api/auth/callback/credentials` request
   - Look at the response - it should show the actual error

### Common Issues

**Issue:** "Invalid email or password" even with correct credentials
- **Solution:** Check that Firebase environment variables are set correctly
- The app uses Firestore to verify users, so Firebase must be configured

**Issue:** Login redirects back to login page
- **Solution:** `NEXTAUTH_SECRET` is likely missing or incorrect
- Generate a new secret and redeploy

**Issue:** "Server configuration error"
- **Solution:** `NEXTAUTH_SECRET` or `NEXTAUTH_URL` is missing
- Double-check all environment variables are set

## Quick Checklist

Before testing login, verify:

- [ ] `NEXTAUTH_SECRET` is set in Vercel
- [ ] `NEXTAUTH_URL` is set to your exact Vercel domain (https://namibian-football-xjv7.vercel.app)
- [ ] All Firebase environment variables are set (NEXT_PUBLIC_FIREBASE_*)
- [ ] Environment variables are set for **Production** environment
- [ ] You've redeployed after adding environment variables
- [ ] Firebase project has Firestore enabled
- [ ] Your admin user exists in Firestore (or will be created on first login)

## Need Help?

If you're still having issues:

1. Check Vercel deployment logs for errors
2. Check browser console (F12) for client-side errors
3. Verify your Firebase project is set up correctly
4. Make sure your admin email is: `brandonkatjitundu@gmail.com`

## After Fixing

Once login works, you should be able to:
- Access the admin dashboard
- Create/edit leagues, teams, fixtures
- Manage articles and users
- All other admin functions

---

**Note:** The "Unchecked runtime.lastError: The message port closed" errors are from browser extensions (like ad blockers, password managers, etc.) and can be safely ignored. They don't affect your app's functionality.

