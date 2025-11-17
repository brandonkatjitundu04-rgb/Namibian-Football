import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from 'firebase/app'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics'

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check for missing required config values
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error(
    `❌ Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
    `Please set these in your .env file. See FIREBASE_SETUP.md for instructions.`
  )
}

const firebaseConfig: FirebaseOptions = {
  apiKey: requiredEnvVars.apiKey || '',
  authDomain: requiredEnvVars.authDomain || '',
  projectId: requiredEnvVars.projectId || '',
  storageBucket: requiredEnvVars.storageBucket || '',
  messagingSenderId: requiredEnvVars.messagingSenderId || '',
  appId: requiredEnvVars.appId || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app: FirebaseApp | null = null
try {
  if (!getApps().length) {
    // Validate config before initializing
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      if (typeof window !== 'undefined') {
        throw new Error(
          'Firebase configuration is incomplete. Please check your environment variables.'
        )
      }
      // In server-side rendering, we might not have config yet
      console.warn('Firebase config incomplete, but continuing in SSR context')
    }
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  if (typeof window !== 'undefined') {
    throw error
  }
  // In SSR, we'll create a minimal app object to prevent crashes
  app = null
}

// Initialize Firestore with error handling
let _db: Firestore | null = null
export const db: Firestore = (() => {
  if (!app) {
    throw new Error('Firebase app not initialized. Please check your Firebase configuration.')
  }
  if (!_db) {
    try {
      _db = getFirestore(app)
      // Connect to emulator in development if configured
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true' &&
        typeof window !== 'undefined'
      ) {
        try {
          connectFirestoreEmulator(_db, 'localhost', 8080)
        } catch (e) {
          // Emulator already connected or not available
        }
      }
    } catch (error) {
      console.error('❌ Firestore initialization error:', error)
      throw error
    }
  }
  return _db
})()

// Initialize Auth with proper error handling
let _auth: Auth | null = null
const getAuthInstance = (): Auth | null => {
  if (!app) {
    return null
  }
  if (!_auth) {
    try {
      // Only initialize auth in browser or if API key is present
      if (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        _auth = getAuth(app)
        // Connect to emulator in development if configured
        if (
          process.env.NODE_ENV === 'development' &&
          process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true' &&
          typeof window !== 'undefined'
        ) {
          try {
            connectAuthEmulator(_auth, 'http://localhost:9099', { disableWarnings: true })
          } catch (e) {
            // Emulator already connected or not available
          }
        }
        return _auth
      }
    } catch (error) {
      console.warn('⚠️ Firebase Auth not initialized:', error)
      return null
    }
  }
  return _auth
}

// Export auth with proper null handling
export const auth: Auth | null = getAuthInstance()

// Helper to ensure auth is available (throws if not)
export const requireAuth = (): Auth => {
  const authInstance = getAuthInstance()
  if (!authInstance) {
    throw new Error(
      'Firebase Auth is not available. Please check your Firebase configuration and ensure you are in a browser environment.'
    )
  }
  return authInstance
}

// Initialize Analytics (only in browser)
export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === 'undefined' || !app) {
    return null
  }
  try {
    const supported = await isSupported()
    if (supported) {
      return getAnalytics(app)
    }
  } catch (error) {
    console.warn('⚠️ Firebase Analytics not available:', error)
  }
  return null
}

export default app

