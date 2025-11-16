import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get('gender') || undefined
    const tier = searchParams.get('tier') || undefined

    // Fetch all leagues first
    let leagues = await firestore.league.findMany(
      tier ? { tier } : undefined,
      { orderBy: { tier: 'asc' } }
    )

    // Filter by gender on client side if needed (to handle leagues without gender field)
    if (gender) {
      leagues = leagues.filter(league => {
        // If league has no gender field, default to MALE for backward compatibility
        const leagueGender = league.gender || 'MALE'
        return leagueGender === gender
      })
    }

    return NextResponse.json(leagues)
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
}
