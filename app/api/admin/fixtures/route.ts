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
    const { 
      leagueId, 
      homeTeamId, 
      awayTeamId, 
      kickoff, 
      venue, 
      status,
      streamingUrl,
      ticketUrl,
      referee,
      notes
    } = body

    const fixture = await firestore.fixture.create({
      leagueId,
      homeTeamId,
      awayTeamId,
      kickoff: new Date(kickoff),
      venue: venue || null,
      status: status || 'SCHEDULED',
      homeScore: 0,
      awayScore: 0,
      streamingUrl: streamingUrl || null,
      ticketUrl: ticketUrl || null,
      referee: referee || null,
      notes: notes || null,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'Fixture',
      entityId: fixture.id,
      changes: body,
    })

    return NextResponse.json(fixture)
  } catch (error) {
    console.error('Error creating fixture:', error)
    return NextResponse.json(
      { error: 'Failed to create fixture' },
      { status: 500 }
    )
  }
}

