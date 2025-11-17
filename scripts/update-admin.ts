// Load environment variables
import { config } from 'dotenv'
config()

import { db } from '../lib/firebase'
import { 
  collection, 
  doc, 
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  limit,
  Timestamp
} from 'firebase/firestore'
import * as bcrypt from 'bcryptjs'

const COLLECTIONS = {
  USERS: 'users',
} as const

async function main() {
  console.log('🔐 Updating admin user credentials...')

  // Validate Firebase connection
  try {
    // Test Firestore connection
    const testQuery = query(collection(db, COLLECTIONS.USERS), limit(1))
    await getDocs(testQuery)
    console.log('✅ Firebase connection verified')
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message)
    console.error('Please check your Firebase configuration in .env file')
    throw new Error('Firebase connection failed. Please check your configuration.')
  }

  const adminEmail = 'branden.katjitundu04@gmail.com'
  const adminPassword = 'wozza2025!'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  // Check if admin user already exists
  const usersQuery = query(collection(db, COLLECTIONS.USERS), where('email', '==', adminEmail), limit(1))
  const existingUsers = await getDocs(usersQuery)
  
  if (!existingUsers.empty) {
    // Update existing user
    const adminDocRef = doc(db, COLLECTIONS.USERS, existingUsers.docs[0].id)
    await updateDoc(adminDocRef, {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      updatedAt: Timestamp.now(),
    })
    console.log('✅ Updated admin user')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
  } else {
    // Create new admin user
    const adminDocRef = doc(collection(db, COLLECTIONS.USERS))
    const adminData = {
      email: adminEmail,
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(adminDocRef, adminData)
    console.log('✅ Created admin user')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
  }

  console.log('🎉 Admin credentials updated!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

