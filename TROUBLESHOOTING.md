# Troubleshooting Admin Login on Vercel

## ✅ Your Environment Variables Are Set!

I can see you have all the required environment variables configured in Vercel:
- ✅ All Firebase variables (NEXT_PUBLIC_FIREBASE_*)
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

## 🔴 Critical Next Step: Redeploy!

**The most important thing:** Environment variables only take effect after a **new deployment**. Since your variables were added 2 days ago, you need to redeploy:

### How to Redeploy:

1. **Option 1: Trigger a new deployment**
   - Go to your Vercel dashboard
   - Click on **Deployments** tab
   - Find your latest deployment
   - Click the **⋯** (three dots) menu
   - Select **Redeploy**
   - Make sure to select "Use existing Build Cache" = **No** (to ensure fresh build)

2. **Option 2: Push a new commit**
   - Make any small change (like adding a comment)
   - Commit and push to trigger automatic deployment

3. **Option 3: Manual redeploy from CLI**
   ```bash
   vercel --prod
   ```

## 🔍 Verify NEXTAUTH_URL Value

Make sure your `NEXTAUTH_URL` in Vercel is set to exactly:
```
https://namibian-football-xjv7.vercel.app
```

**Important:**
- Must include `https://`
- Must match your exact Vercel domain
- No trailing slash

## 🐛 Debugging Steps

After redeploying, if login still doesn't work:

### 1. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on your latest deployment
3. Click **Functions** tab
4. Look for `/api/auth/[...nextauth]` function
5. Check for any errors in the logs

### 2. Check Browser Console

1. Open your site: https://namibian-football-xjv7.vercel.app/admin/login
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try to login
5. Look for any error messages

### 3. Check Network Tab

1. In DevTools, go to **Network** tab
2. Try to login
3. Look for the `/api/auth/callback/credentials` request
4. Click on it and check:
   - **Status code** (should be 200 for success)
   - **Response** tab (shows the actual error if any)

### 4. Verify Firebase Connection

The app uses Firestore for user authentication. Check:

1. **Firebase Console**: https://console.firebase.google.com/
2. Make sure Firestore is enabled
3. Check if your admin user exists in the `users` collection
4. If not, it will be created on first login (if Firebase is working)

## 🔧 Common Issues & Solutions

### Issue: "Invalid email or password" with correct credentials

**Possible causes:**
1. Firebase environment variables are incorrect
2. Firestore connection is failing
3. User doesn't exist in Firestore

**Solution:**
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are correct
- Check Vercel function logs for Firebase errors
- The super admin user will be auto-created on first login if Firebase works

### Issue: Login redirects back to login page

**Possible causes:**
1. `NEXTAUTH_SECRET` is missing or incorrect
2. `NEXTAUTH_URL` doesn't match your domain
3. Session cookies aren't being set

**Solution:**
- Double-check `NEXTAUTH_URL` matches exactly: `https://namibian-football-xjv7.vercel.app`
- Regenerate `NEXTAUTH_SECRET` if unsure
- Clear browser cookies and try again

### Issue: "Server configuration error"

**Possible causes:**
1. `NEXTAUTH_SECRET` is missing
2. Environment variables not loaded (need redeploy)

**Solution:**
- Verify `NEXTAUTH_SECRET` is set in Vercel
- **Redeploy** after adding/updating environment variables

## 📋 Quick Checklist

Before testing login:

- [ ] All environment variables are set in Vercel
- [ ] `NEXTAUTH_URL` = `https://namibian-football-xjv7.vercel.app` (exact match)
- [ ] You've **redeployed** after setting environment variables
- [ ] Deployment completed successfully (check Vercel dashboard)
- [ ] Firebase project has Firestore enabled
- [ ] You're using the correct admin email: `brandonkatjitundu@gmail.com`

## 🆘 Still Having Issues?

If login still doesn't work after redeploying:

1. **Share the error message** you see in:
   - Browser console (F12)
   - Vercel function logs
   - Network tab response

2. **Check these specific things:**
   - What error message appears on the login page?
   - What's in the browser console?
   - What's in the Vercel function logs for `/api/auth/[...nextauth]`?

3. **Test Firebase connection:**
   - Try accessing Firestore directly from Firebase Console
   - Verify your Firebase project is active
   - Check if there are any quota/billing issues

## 💡 Pro Tip

After redeploying, wait 1-2 minutes for the deployment to fully propagate, then:
1. Clear your browser cache
2. Try logging in again
3. Check both browser console and Vercel logs

---

**Remember:** The "message port closed" errors are from browser extensions and can be ignored. Focus on the actual login functionality.

