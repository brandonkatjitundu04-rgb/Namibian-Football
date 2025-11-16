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

