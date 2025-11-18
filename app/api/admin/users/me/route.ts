import { NextRequest, NextResponse } from 'next/server'
import { getClerkUser } from '@/lib/clerk-auth'
import { firestore } from '@/lib/firestore'

// GET current user profile
export async function GET(request: NextRequest) {
  try {
    const clerkUser = await getClerkUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await firestore.user.findById(clerkUser.id) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT update current user profile
export async function PUT(request: NextRequest) {
  try {
    const clerkUser = await getClerkUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, profilePicture } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture

    const updatedUser = await firestore.user.update(clerkUser.id, updateData) as any

    // Log audit
    await firestore.auditLog.create({
      userId: clerkUser.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: clerkUser.id,
      changes: updateData,
    })

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

