import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

// GET single advertisement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ad = await firestore.advertisement.findUnique(id)
    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 })
    }

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error fetching advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advertisement' },
      { status: 500 }
    )
  }
}

// PUT update advertisement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can update advertisements' }, { status: 403 })
    }

    const body = await request.json()
    const { title, imageUrl, linkUrl, position, page, isActive, startDate, endDate } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl
    if (position !== undefined) updateData.position = position
    if (page !== undefined) {
      // Normalize page: empty string or whitespace becomes null (for "all pages")
      updateData.page = page && page.trim() !== '' ? page.trim() : null
    }
    if (isActive !== undefined) updateData.isActive = isActive
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const ad = await firestore.advertisement.update(id, updateData)

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'Advertisement',
      entityId: id,
      changes: updateData,
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error updating advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to update advertisement' },
      { status: 500 }
    )
  }
}

// DELETE advertisement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can delete advertisements' }, { status: 403 })
    }

    await firestore.advertisement.delete(id)

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'Advertisement',
      entityId: id,
    })

    return NextResponse.json({ message: 'Advertisement deleted successfully' })
  } catch (error) {
    console.error('Error deleting advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to delete advertisement' },
      { status: 500 }
    )
  }
}

