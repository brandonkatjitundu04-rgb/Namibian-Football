import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get('gender') || 'MALE'

    // Get premier league - fetch all premier leagues and filter by gender
    let allPremierLeagues = await firestore.league.findMany(
      { tier: 'PREMIER' },
      {
        include: {
          tableRows: {
            include: {
              team: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      }
    )
    
    console.log(`Found ${allPremierLeagues.length} premier leagues, filtering for gender: ${gender}`)
    
    // Filter by gender (default to MALE if no gender field)
    let league = allPremierLeagues.find((l: any) => {
      const leagueGender = l.gender || 'MALE'
      return leagueGender === gender
    }) as any
    
    // Fallback to first premier league if no match
    if (!league && allPremierLeagues.length > 0) {
      console.log(`No league found for gender ${gender}, using first premier league as fallback`)
      league = allPremierLeagues[0] as any
    }
    
    console.log(`Selected league: ${league?.name || 'none'} (gender: ${league?.gender || 'MALE'})`)

    // If league exists but has no table rows, get teams and create default table rows
    if (league && (!league.tableRows || league.tableRows.length === 0)) {
      const teams = await firestore.team.findMany({ leagueId: league.id })
      league.tableRows = teams.map((team: any, index: number) => ({
        id: `temp-${team.id}`,
        teamId: team.id,
        leagueId: league.id,
        position: index + 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        team: team,
      }))
    }
    
    // Limit to top 5 teams for home page preview
    if (league && league.tableRows && league.tableRows.length > 5) {
      league.tableRows = league.tableRows.slice(0, 5)
    }

    // Get upcoming fixtures - fetch all scheduled fixtures first
    let allUpcomingFixtures = await firestore.fixture.findMany(
      {
        status: 'SCHEDULED',
      },
      {
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        },
        orderBy: {
          kickoff: 'asc',
        },
        take: 50, // Fetch more to filter
      }
    )

    // Get all teams for gender filtering
    const allTeams = await firestore.team.findMany() as any[]
    const genderTeamIds = allTeams
      .filter((t: any) => {
        const teamGender = t.gender || 'MALE'
        return teamGender === gender
      })
      .map((t: any) => t.id)
    
    console.log(`Found ${allTeams.length} total teams, ${genderTeamIds.length} match gender ${gender}`)
    console.log(`Found ${allUpcomingFixtures.length} scheduled fixtures`)

    // Filter fixtures: must be in future (or today), and both teams must match gender
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today for comparison
    
    let upcomingFixtures = allUpcomingFixtures
      .filter(f => {
        // Check if kickoff is today or in the future
        if (f.kickoff) {
          const kickoffDate = new Date(f.kickoff)
          kickoffDate.setHours(0, 0, 0, 0)
          if (kickoffDate < now) return false
        }
        // If no kickoff date, still include it (might be TBD)
        
        // If we have no gender teams at all, show all fixtures
        if (allTeams.length === 0 || genderTeamIds.length === 0) {
          return true
        }
        
        // Check if both teams match the selected gender
        // If a team doesn't exist in our list, default to including it
        const homeTeamMatches = !f.homeTeamId || genderTeamIds.includes(f.homeTeamId)
        const awayTeamMatches = !f.awayTeamId || genderTeamIds.includes(f.awayTeamId)
        
        return homeTeamMatches && awayTeamMatches
      })
      .slice(0, 5)
    
    console.log(`Filtered to ${upcomingFixtures.length} upcoming fixtures for gender ${gender}`)

    // Get recent results - fetch all finished fixtures first
    let allRecentResults = await firestore.fixture.findMany(
      {
        status: 'FINISHED',
      },
      {
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        },
        orderBy: {
          kickoff: 'desc',
        },
        take: 50, // Fetch more to filter
      }
    )

    // Filter results to only include those with teams of the selected gender
    let recentResults = allRecentResults
      .filter(f => {
        // If we have no teams at all, show all results
        if (allTeams.length === 0 || genderTeamIds.length === 0) {
          return true
        }
        // Check if both teams match the selected gender
        // If a team doesn't exist in our list, default to including it
        const homeTeamMatches = !f.homeTeamId || genderTeamIds.includes(f.homeTeamId)
        const awayTeamMatches = !f.awayTeamId || genderTeamIds.includes(f.awayTeamId)
        return homeTeamMatches && awayTeamMatches
      })
      .slice(0, 5)
    
    console.log(`Filtered to ${recentResults.length} recent results for gender ${gender}`)

    return NextResponse.json({
      league,
      upcomingFixtures: upcomingFixtures || [],
      recentResults: recentResults || [],
    })
  } catch (error) {
    console.error('Error fetching home data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    )
  }
}

