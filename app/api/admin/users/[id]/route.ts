import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'
import bcrypt from 'bcryptjs'

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await firestore.user.findById(id) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Regular admins cannot see super admins
    if (userRole !== 'SUPER_ADMIN' && user.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT update user (only SUPER_ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can update users' }, { status: 403 })
    }

    const user = await firestore.user.findById(id) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent modifying super admin (except the current super admin themselves)
    if (user.role === 'SUPER_ADMIN' && user.email !== 'brandonkatjitundu@gmail.com') {
      return NextResponse.json(
        { error: 'Cannot modify super admin user' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, password, role } = body

    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (role !== undefined) {
      // Prevent changing super admin role
      if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Cannot change super admin role' },
          { status: 403 }
        )
      }
      // Only allow ADMIN or EDITOR roles
      if (!['ADMIN', 'EDITOR'].includes(role)) {
        return NextResponse.json(
          { error: 'Role must be ADMIN or EDITOR' },
          { status: 400 }
        )
      }
      updateData.role = role
    }
    if (password !== undefined && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const updatedUser = await firestore.user.update(id, updateData) as any

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      changes: updateData,
    })

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE user (only SUPER_ADMIN, cannot delete super admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can delete users' }, { status: 403 })
    }

    const user = await firestore.user.findById(id) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting super admin
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete super admin user' },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 403 }
      )
    }

    await firestore.user.delete(id)

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'User',
      entityId: id,
      changes: { email: user.email },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

