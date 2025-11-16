import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const player = await firestore.player.findUnique(params.id, {
      include: {
        team: {
          include: {
            league: true,
          },
        },
        matchEvents: {
          include: {
            fixture: {
              include: {
                homeTeam: true,
                awayTeam: true,
              },
            },
          },
          orderBy: {
            fixture: {
              kickoff: 'desc',
            },
          },
        },
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

