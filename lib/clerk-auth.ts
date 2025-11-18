import { auth, currentUser } from '@clerk/nextjs/server'
import { firestore } from './firestore'

/**
 * Get the current authenticated user from Clerk and sync with Firestore
 * Returns user info compatible with the existing system
 */
export async function getClerkUser() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return null
    }

    // Check if user exists in Firestore, create if not
    let firestoreUser: any = await firestore.user.findUnique(email)
    
    if (!firestoreUser) {
      // Create user in Firestore on first login
      // Determine role: SUPER_ADMIN for admin email, otherwise USER for public users
      const defaultRole = email === 'brandonkatjitundu@gmail.com' ? 'SUPER_ADMIN' : 'USER'
      
      firestoreUser = await firestore.user.create({
        email: email,
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        role: defaultRole,
        clerkId: userId,
      })
    } else if (!firestoreUser.clerkId) {
      // Link existing Firestore user with Clerk ID
      await firestore.user.update(firestoreUser.id, { clerkId: userId })
      firestoreUser.clerkId = userId
    }

    // Get role from Firestore or metadata
    // Default to USER for public users, SUPER_ADMIN for admin email
    const defaultRole = email === 'brandonkatjitundu@gmail.com' ? 'SUPER_ADMIN' : 'USER'
    const role = firestoreUser.role || 
                 (clerkUser.publicMetadata?.role as string) ||
                 defaultRole

    return {
      id: firestoreUser.id,
      clerkId: userId,
      email: email,
      name: firestoreUser.name || clerkUser.fullName || clerkUser.firstName || 'User',
      role: role,
      profilePicture: clerkUser.imageUrl || firestoreUser.profilePicture,
    }
  } catch (error) {
    console.error('Error getting Clerk user:', error)
    return null
  }
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: string | string[]) {
  const user = await getClerkUser()
  if (!user) return false
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

/**
 * Get user role for API route protection
 */
export async function getUserRole() {
  const user = await getClerkUser()
  return user?.role || null
}

