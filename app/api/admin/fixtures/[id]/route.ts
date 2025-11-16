import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'
import { recalculateAndSaveLeagueTable } from '@/lib/table-calculator'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { homeTeamId, awayTeamId, kickoff, venue, status, homeScore, awayScore } = body

    const fixture = await firestore.fixture.update(params.id, {
      homeTeamId,
      awayTeamId,
      kickoff: new Date(kickoff),
      venue,
      status,
      homeScore: homeScore !== null ? parseInt(homeScore) : null,
      awayScore: awayScore !== null ? parseInt(awayScore) : null,
    })

    // If fixture is finished, recalculate league table
    if (status === 'FINISHED' && fixture) {
      await recalculateAndSaveLeagueTable(fixture.leagueId)
    }

    // Log audit
    await firestore.auditLog.create({
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'Fixture',
      entityId: params.id,
      changes: body,
    })

    return NextResponse.json(fixture)
  } catch (error) {
    console.error('Error updating fixture:', error)
    return NextResponse.json(
      { error: 'Failed to update fixture' },
      { status: 500 }
    )
  }
}

