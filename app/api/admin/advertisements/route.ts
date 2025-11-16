import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

// GET all advertisements (only SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can manage advertisements' }, { status: 403 })
    }

    const ads = await firestore.advertisement.findMany()
    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    )
  }
}

// POST create new advertisement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admin can create advertisements' }, { status: 403 })
    }

    const body = await request.json()
    const { title, imageUrl, linkUrl, position, page, isActive, startDate, endDate } = body

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { error: 'Title, image URL, and position are required' },
        { status: 400 }
      )
    }

    // Normalize page: empty string or whitespace becomes null (for "all pages")
    const normalizedPage = page && page.trim() !== '' ? page.trim() : null
    
    const ad = await firestore.advertisement.create({
      title,
      imageUrl,
      linkUrl: linkUrl || null,
      position,
      page: normalizedPage,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      clickCount: 0,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'Advertisement',
      entityId: ad.id,
      changes: body,
    })

    return NextResponse.json(ad, { status: 201 })
  } catch (error) {
    console.error('Error creating advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to create advertisement' },
      { status: 500 }
    )
  }
}

