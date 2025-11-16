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
    const { name, season, logoUrl, tier, gender, winPoints, drawPoints, lossPoints } = body

    const league = await firestore.league.create({
      name,
      season,
      logoUrl: logoUrl || null,
      tier,
      gender: gender || 'MALE',
      winPoints: winPoints || 3,
      drawPoints: drawPoints || 1,
      lossPoints: lossPoints || 0,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'League',
      entityId: league.id,
      changes: body,
    })

    return NextResponse.json(league)
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    )
  }
}

