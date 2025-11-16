import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, logoUrl, tier, website } = body

    const sponsor = await firestore.sponsor.create({
      name,
      logoUrl: logoUrl || null,
      tier,
      website: website || null,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'Sponsor',
      entityId: sponsor.id,
      changes: body,
    })

    return NextResponse.json(sponsor)
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to create sponsor' },
      { status: 500 }
    )
  }
}

