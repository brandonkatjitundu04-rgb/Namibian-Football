import { NextRequest, NextResponse } from 'next/server'
import { getClerkUser, hasRole } from '@/lib/clerk-auth'
import { firestore } from '@/lib/firestore'
import bcrypt from 'bcryptjs'

// GET all users (only SUPER_ADMIN can see all, ADMIN can see non-super-admins)
export async function GET(request: NextRequest) {
  try {
    const user = await getClerkUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = user.role
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await firestore.user.findMany() as any[]
    
    // Filter out password hashes and filter by role if not super admin
    const filteredUsers = users
      .filter((user: any) => {
        // Super admin can see all users
        if (userRole === 'SUPER_ADMIN') return true
        // Regular admins can only see non-super-admins
        return user.role !== 'SUPER_ADMIN'
      })
      .map(({ passwordHash, ...user }: any) => user) // Remove password hash from response

    return NextResponse.json(filteredUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST create new user (only SUPER_ADMIN)
// Note: With Clerk, users are created through Clerk. This endpoint can be used to sync Clerk users to Firestore
export async function POST(request: NextRequest) {
  try {
    const user = await getClerkUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can create users' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, role } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['ADMIN', 'EDITOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be ADMIN or EDITOR' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await firestore.user.findUnique(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await firestore.user.create({
      email: email.toLowerCase(),
      name: name || null,
      passwordHash,
      role,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: user.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: newUser.id,
      changes: { email, name, role },
    })

    // Return user without password hash
    const newUserAny = newUser as any
    const { passwordHash: _, ...userWithoutPassword } = newUserAny
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

