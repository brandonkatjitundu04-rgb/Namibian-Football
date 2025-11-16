# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name
   - (Optional) Enable Google Analytics
   - Create project

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Start in production mode**
4. Select a location for your database
5. Click **Enable**

## Step 3: Enable Authentication (Optional)

If you want to use Firebase Auth instead of NextAuth:

1. Go to **Build** > **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider (or others as needed)

## Step 4: Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (give it a nickname)
5. Copy the `firebaseConfig` object values

## Step 5: Update .env File

Update your `.env` file with the values from Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 6: Firestore Security Rules

Update your Firestore security rules in Firebase Console > Firestore Database > Rules:

For development (test mode):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 12, 31);
    }
  }
}
```

For production, set up proper authentication-based rules.

## Next Steps

After setting up Firebase, you'll need to:
1. Migrate your Prisma schema to Firestore collections
2. Update your code to use Firestore instead of Prisma
3. Update authentication if switching from NextAuth to Firebase Auth

