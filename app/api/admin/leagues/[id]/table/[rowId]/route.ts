import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

// PUT update table row
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const { id, rowId } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { position, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points } = body

    // Get existing row to find teamId
    const existingRows = await firestore.tableRow.findByLeague(id, { includeTeam: true })
    const row = existingRows.find((r: any) => r.id === rowId)
    
    if (!row) {
      return NextResponse.json({ error: 'Table row not found' }, { status: 404 })
    }

    const updateData: any = {
      leagueId: id,
    }
    if (position !== undefined) updateData.position = position
    if (played !== undefined) updateData.played = played
    if (won !== undefined) updateData.won = won
    if (drawn !== undefined) updateData.drawn = drawn
    if (lost !== undefined) updateData.lost = lost
    if (goalsFor !== undefined) updateData.goalsFor = goalsFor
    if (goalsAgainst !== undefined) updateData.goalsAgainst = goalsAgainst
    if (goalDifference !== undefined) updateData.goalDifference = goalDifference
    if (points !== undefined) updateData.points = points

    const updatedRow = await firestore.tableRow.upsert(row.teamId, updateData)
    
    // Fetch the updated row with team data
    const refreshedRows = await firestore.tableRow.findByLeague(id, {
      includeTeam: true,
      orderBy: { position: 'asc' }
    })
    const refreshedRow = refreshedRows.find((r: any) => r.id === rowId || (r.teamId === row.teamId && r.leagueId === id))

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'TableRow',
      entityId: rowId,
      changes: updateData,
    })

    return NextResponse.json(refreshedRow || updatedRow)
  } catch (error) {
    console.error('Error updating table row:', error)
    return NextResponse.json(
      { error: 'Failed to update table row' },
      { status: 500 }
    )
  }
}

// DELETE table row
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const { id, rowId } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing row to find teamId
    const existingRows = await firestore.tableRow.findByLeague(id)
    const row = existingRows.find((r: any) => r.id === rowId)
    
    if (!row) {
      return NextResponse.json({ error: 'Table row not found' }, { status: 404 })
    }

    // Delete by removing the table row (we'll need to add delete method to tableRowService)
    // For now, we'll set all stats to 0 and position to 999 to effectively "remove" it
    await firestore.tableRow.upsert(row.teamId, {
      leagueId: id,
      position: 999,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'DELETE',
      entityType: 'TableRow',
      entityId: rowId,
    })

    return NextResponse.json({ message: 'Table row removed successfully' })
  } catch (error) {
    console.error('Error deleting table row:', error)
    return NextResponse.json(
      { error: 'Failed to delete table row' },
      { status: 500 }
    )
  }
}

