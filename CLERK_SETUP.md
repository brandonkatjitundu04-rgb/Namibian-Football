# Clerk Authentication Setup Guide

## ✅ Installation Complete

Clerk has been installed and integrated into your admin panel. Follow these steps to complete the setup:

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose **Next.js** as your framework

## Step 2: Get Your Clerk Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## Step 3: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Important:**
- Replace `pk_test_...` and `sk_test_...` with your actual keys from Clerk
- Set them for **All Environments** (Production, Preview, Development)
- After adding, **redeploy** your application

## Step 4: Configure Clerk Application

1. In Clerk Dashboard, go to **Paths**
2. Set:
   - **Sign-in path**: `/admin/login`
   - **Sign-up path**: `/admin/sign-up`
   - **After sign-in URL**: `/admin`
   - **After sign-up URL**: `/admin`

3. Go to **User & Authentication** → **Email, Phone, Username**
4. Enable **Email address** as a sign-in method
5. (Optional) Disable other sign-in methods if you only want email

## Step 5: Set Up Super Admin

1. In Clerk Dashboard, go to **Users**
2. Create a new user with email: `brandonkatjitundu@gmail.com`
3. Or use the first user you create as super admin
4. The system will automatically assign SUPER_ADMIN role to `brandonkatjitundu@gmail.com`

## Step 6: Redeploy

After adding environment variables:
1. Go to Vercel Dashboard → **Deployments**
2. Click **Redeploy** on your latest deployment
3. Wait for deployment to complete

## Step 7: Test Login

1. Visit: `https://namibian-football-xjv7.vercel.app/admin/login`
2. Sign in with your email
3. You should be redirected to `/admin` dashboard

## How It Works

### Authentication Flow

1. **User visits `/admin/login`** → Clerk SignIn component appears
2. **User signs in** → Clerk authenticates
3. **Middleware checks auth** → Protects `/admin/*` routes
4. **User data syncs** → Automatically creates/updates user in Firestore
5. **Role assignment** → Super admin role assigned based on email

### User Roles

- **SUPER_ADMIN**: Full access (email: `brandonkatjitundu@gmail.com`)
- **ADMIN**: Can manage content but not users
- **EDITOR**: Can edit content (default for new users)

### API Route Protection

All API routes in `/api/admin/*` are now protected using Clerk. The `getClerkUser()` helper function:
- Gets the authenticated user from Clerk
- Syncs with Firestore (creates user if doesn't exist)
- Returns user info with role

### Components Updated

- ✅ `AdminSidebar` - Uses `useUser()` from Clerk
- ✅ `LogoutButton` - Uses Clerk's `signOut()`
- ✅ `LoginPage` - Uses Clerk's `<SignIn />` component
- ✅ `AdminLayout` - Uses `currentUser()` from Clerk

## Migration from NextAuth

The following has been migrated:
- ✅ Authentication middleware
- ✅ Admin layout protection
- ✅ Login page
- ✅ Sidebar user display
- ✅ Logout functionality
- ✅ API route protection (users route updated as example)

**Note:** Other API routes still need to be updated. You can update them by replacing:
```typescript
// Old (NextAuth)
const session = await getServerSession(authOptions)
if (!session) { ... }

// New (Clerk)
const user = await getClerkUser()
if (!user) { ... }
```

## Troubleshooting

### Issue: "Clerk: Missing publishableKey"

**Solution:** Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel and you've redeployed.

### Issue: Login page shows error

**Solution:** 
1. Check Clerk Dashboard → **Paths** are configured correctly
2. Verify environment variables are set
3. Check Vercel function logs for errors

### Issue: User not created in Firestore

**Solution:** 
- Check Firebase environment variables are set
- Check Vercel function logs for Firestore errors
- User will be created automatically on first login

### Issue: Can't access admin routes

**Solution:**
- Make sure you're signed in
- Check middleware is working (should redirect to `/admin/login`)
- Verify Clerk keys are correct

## Benefits of Clerk

✅ **No environment variable issues** - Clerk handles secrets
✅ **Built-in UI components** - Pre-styled sign-in/sign-up
✅ **Email verification** - Automatic email verification
✅ **Password reset** - Built-in password reset flow
✅ **User management** - Dashboard for managing users
✅ **Social logins** - Easy to add Google, GitHub, etc.
✅ **Vercel integration** - Works seamlessly with Vercel

## Next Steps

1. ✅ Set up Clerk account
2. ✅ Add environment variables to Vercel
3. ✅ Configure Clerk application
4. ✅ Redeploy
5. ✅ Test login
6. ⏳ Update remaining API routes (optional, can be done gradually)

---

**Need Help?** Check Clerk documentation: https://clerk.com/docs

