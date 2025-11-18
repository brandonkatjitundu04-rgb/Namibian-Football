import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const player = await firestore.player.findUnique(id, {
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

