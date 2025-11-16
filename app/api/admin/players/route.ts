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
    const { firstName, lastName, photoUrl, position, squadStatus, shirtNumber, teamId, dob } = body

    const player = await firestore.player.create({
      firstName,
      lastName,
      photoUrl: photoUrl || null,
      position,
      squadStatus: squadStatus || 'FIRST_TEAM',
      shirtNumber: shirtNumber ? parseInt(shirtNumber) : null,
      teamId,
      dob: dob ? new Date(dob) : null,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'Player',
      entityId: player.id,
      changes: body,
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}

