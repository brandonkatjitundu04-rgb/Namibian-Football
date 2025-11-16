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
    const { name, shortName, crestUrl, stadium, leagueId, gender, founded } = body

    const team = await firestore.team.create({
      name,
      shortName,
      crestUrl: crestUrl || null,
      stadium: stadium || null,
      leagueId,
      gender: gender || 'MALE',
      founded: founded ? parseInt(founded) : null,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'Team',
      entityId: team.id,
      changes: body,
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

