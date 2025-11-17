import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId') || undefined

    const filters: any = {}
    if (teamId) filters.teamId = teamId

    const players = await firestore.player.findMany(
      Object.keys(filters).length > 0 ? filters : undefined
    )
    
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

