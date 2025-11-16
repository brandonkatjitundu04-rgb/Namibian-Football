import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const team = await firestore.team.findUnique(params.id, {
      include: {
        league: true,
        players: true,
        staff: true,
        tableRow: true,
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

