import { firestore } from './firestore'

export interface TableRowData {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface LeagueRules {
  winPoints: number
  drawPoints: number
  lossPoints: number
}

/**
 * Calculate league table from fixtures
 */
export async function calculateLeagueTable(
  leagueId: string,
  rules?: LeagueRules
): Promise<TableRowData[]> {
  // Get league rules
  const league = await firestore.league.findUnique(leagueId)

  if (!league) {
    throw new Error('League not found')
  }

  const leagueRules: LeagueRules = rules || {
    winPoints: league.winPoints || 3,
    drawPoints: league.drawPoints || 1,
    lossPoints: league.lossPoints || 0,
  }

  // Get all teams in the league
  const teams = await firestore.team.findMany({ leagueId })

  // Get all finished fixtures
  const finishedFixtures = await firestore.fixture.findMany({
    leagueId,
    status: 'FINISHED',
  })

  // Initialize table data
  const tableData = new Map<string, TableRowData>()

  for (const team of teams) {
    tableData.set(team.id, {
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  }

  // Process fixtures
  for (const fixture of finishedFixtures) {
    if (fixture.homeScore === null || fixture.awayScore === null) continue

    const homeData = tableData.get(fixture.homeTeamId)!
    const awayData = tableData.get(fixture.awayTeamId)!

    homeData.played++
    awayData.played++
    homeData.goalsFor += fixture.homeScore
    homeData.goalsAgainst += fixture.awayScore
    awayData.goalsFor += fixture.awayScore
    awayData.goalsAgainst += fixture.homeScore

    if (fixture.homeScore > fixture.awayScore) {
      homeData.won++
      awayData.lost++
      homeData.points += leagueRules.winPoints
      awayData.points += leagueRules.lossPoints
    } else if (fixture.homeScore < fixture.awayScore) {
      homeData.lost++
      awayData.won++
      awayData.points += leagueRules.winPoints
      homeData.points += leagueRules.lossPoints
    } else {
      homeData.drawn++
      awayData.drawn++
      homeData.points += leagueRules.drawPoints
      awayData.points += leagueRules.drawPoints
    }
  }

  // Calculate goal differences
  for (const data of tableData.values()) {
    data.goalDifference = data.goalsFor - data.goalsAgainst
  }

  // Sort by points, then goal difference, then goals for
  const sorted = Array.from(tableData.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  return sorted
}

/**
 * Recalculate and save league table to database
 */
export async function recalculateAndSaveLeagueTable(leagueId: string): Promise<void> {
  const tableData = await calculateLeagueTable(leagueId)

  // Update or create table rows
  for (let i = 0; i < tableData.length; i++) {
    const data = tableData[i]
    await firestore.tableRow.upsert(data.teamId, {
      leagueId,
      position: i + 1,
      played: data.played,
      won: data.won,
      drawn: data.drawn,
      lost: data.lost,
      goalsFor: data.goalsFor,
      goalsAgainst: data.goalsAgainst,
      goalDifference: data.goalDifference,
      points: data.points,
    })
  }
}

