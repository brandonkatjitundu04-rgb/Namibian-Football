import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get('gender') || undefined
    const leagueId = searchParams.get('leagueId') || undefined

    // Fetch all teams first
    let teams = await firestore.team.findMany(
      leagueId ? { leagueId } : undefined
    ) as any[]

    // Filter by gender on client side if needed (to handle teams without gender field)
    if (gender) {
      teams = teams.filter((team: any) => {
        // If team has no gender field, default to MALE for backward compatibility
        const teamGender = team.gender || 'MALE'
        return teamGender === gender
      })
    }

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

