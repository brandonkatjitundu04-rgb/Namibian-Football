import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

// GET league table
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

    const tableRows = await firestore.tableRow.findByLeague(id, { includeTeam: true, orderBy: { position: 'asc' } })
    
    return NextResponse.json(tableRows)
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    )
  }
}

// POST create new table row
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, position, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points } = body

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    const tableRow = await firestore.tableRow.upsert(teamId, {
      leagueId: id,
      position: position || 1,
      played: played || 0,
      won: won || 0,
      drawn: drawn || 0,
      lost: lost || 0,
      goalsFor: goalsFor || 0,
      goalsAgainst: goalsAgainst || 0,
      goalDifference: goalDifference || 0,
      points: points || 0,
    })

    // Fetch the created row with team data
    const createdRow = await firestore.tableRow.findByLeague(id, {
      includeTeam: true,
      orderBy: { position: 'asc' }
    })
    const newRow = createdRow.find((r: any) => r.teamId === teamId && r.leagueId === id)

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'TableRow',
      entityId: tableRow.id,
      changes: body,
    })

    return NextResponse.json(newRow || tableRow, { status: 201 })
  } catch (error: any) {
    console.error('Error creating table row:', error)
    const errorMessage = error?.message || 'Failed to create table row'
    return NextResponse.json(
      { error: errorMessage, details: error?.toString() },
      { status: 500 }
    )
  }
}

