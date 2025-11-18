import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'
import { calculateLeagueTable } from '@/lib/table-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const table = await calculateLeagueTable(id)

    // Get team details
    const teams = await firestore.team.findMany({
      ids: table.map((row) => row.teamId),
    })

    const tableWithTeams = table.map((row) => ({
      ...row,
      team: teams.find((t) => t.id === row.teamId),
    }))

    return NextResponse.json(tableWithTeams)
  } catch (error) {
    console.error('Error fetching league table:', error)
    return NextResponse.json(
      { error: 'Failed to fetch league table' },
      { status: 500 }
    )
  }
}

