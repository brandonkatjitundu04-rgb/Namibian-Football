import bcrypt from 'bcryptjs'

// Script to hash the admin password
// Run this once: npx tsx scripts/hash-password.ts
// Then copy the hash to your .env file or auth.ts

const password = 'footy@na2025!'
const hash = bcrypt.hashSync(password, 10)

console.log('Password hash:', hash)
console.log('\nCopy this hash to your auth configuration')

