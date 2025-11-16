import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { TopScorersChart } from '@/components/stats/TopScorersChart'
import { CSVExportButton } from '@/components/stats/CSVExportButton'

async function getStats() {
  // Get all players with their goal events
  const players = await firestore.player.findMany()
  
  // Get all goal events
  const goalEvents = await firestore.matchEvent.findMany(
    { type: 'GOAL' },
    { include: { player: { include: { team: true } } } }
  )

  // Calculate top scorers
  const goalsByPlayer = goalEvents.reduce((acc, event) => {
    if (!event.player) return acc
    const key = event.player.id
    if (!acc[key]) {
      acc[key] = {
        id: event.player.id,
        name: `${event.player.firstName} ${event.player.lastName}`,
        team: event.player.team?.shortName || 'Unknown',
        goals: 0,
      }
    }
    acc[key].goals++
    return acc
  }, {} as Record<string, { id: string; name: string; team: string; goals: number }>)

  const topScorers = Object.values(goalsByPlayer)
    .filter((p: any) => p.goals > 0)
    .sort((a: any, b: any) => b.goals - a.goals)
    .slice(0, 20)

  // Get assists
  const assistsData = await firestore.matchEvent.findMany(
    { type: 'ASSIST' },
    {
      include: {
        player: {
          include: {
            team: true,
          },
        },
      },
    }
  )

  const assistsByPlayer = assistsData.reduce((acc, event) => {
    if (!event.player) return acc
    const key = event.player.id
    if (!acc[key]) {
      acc[key] = {
        id: event.player.id,
        name: `${event.player.firstName} ${event.player.lastName}`,
        team: event.player.team?.shortName || 'Unknown',
        assists: 0,
      }
    }
    acc[key].assists++
    return acc
  }, {} as Record<string, { id: string; name: string; team: string; assists: number }>)

  const topAssists = Object.values(assistsByPlayer)
    .sort((a: any, b: any) => b.assists - a.assists)
    .slice(0, 20)

  // Get clean sheets (goalkeepers with 0 goals conceded in matches)
  const goalkeepers = await firestore.player.findMany() as any[]
  const gks = goalkeepers.filter((p: any) => p.position === 'GK')
  
  const cleanSheets = await Promise.all(gks.map(async (gk: any) => {
    const team = await firestore.team.findUnique(gk.teamId, {
      include: { league: true }
    }) as any
    if (!team) return null
    
    // Get finished fixtures for this team
    const homeFixtures = await firestore.fixture.findMany(
      { leagueId: team.leagueId, status: 'FINISHED' },
      { include: { homeTeam: true, awayTeam: true } }
    ) as any[]
    const awayFixtures = await firestore.fixture.findMany(
      { leagueId: team.leagueId, status: 'FINISHED' },
      { include: { homeTeam: true, awayTeam: true } }
    ) as any[]
    
    const homeMatches = homeFixtures.filter(
      (f: any) => f.homeTeamId === team.id && f.awayScore === 0
    ).length
    const awayMatches = awayFixtures.filter(
      (f: any) => f.awayTeamId === team.id && f.homeScore === 0
    ).length
    
    return {
      id: gk.id,
      name: `${gk.firstName} ${gk.lastName}`,
      team: team.shortName,
      cleanSheets: homeMatches + awayMatches,
    }
  }))

  const cleanSheetsFiltered = cleanSheets
    .filter((p: any): p is NonNullable<typeof p> => p !== null && p.cleanSheets > 0)
    .sort((a: any, b: any) => b.cleanSheets - a.cleanSheets)
    .slice(0, 10)

  return { topScorers, topAssists, cleanSheets: cleanSheetsFiltered }
}

export default async function StatsPage() {
  const { topScorers, topAssists, cleanSheets } = await getStats()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Statistics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Scorers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Scorers</h2>
            <CSVExportButton
              data={topScorers as any[]}
              filename="top-scorers.csv"
              headers={['Position', 'Player', 'Team', 'Goals']}
            />
          </div>
          <TopScorersChart data={topScorers as any[]} />
          <div className="mt-6 space-y-2">
            {topScorers.slice(0, 10).map((player: any, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary-surface/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted font-semibold w-6">#{index + 1}</span>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-muted">{player.team}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gold-500">{player.goals}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Assists */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Assists</h2>
            <CSVExportButton
              data={topAssists as any[]}
              filename="top-assists.csv"
              headers={['Position', 'Player', 'Team', 'Assists']}
            />
          </div>
          <div className="space-y-2">
            {topAssists.length > 0 ? (
              topAssists.map((player: any, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary-surface/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted font-semibold w-6">#{index + 1}</span>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-muted">{player.team}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-accent-400">{player.assists}</div>
                </div>
              ))
            ) : (
              <p className="text-muted">No assists data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Clean Sheets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Clean Sheets</h2>
          <CSVExportButton
            data={cleanSheets as any[]}
            filename="clean-sheets.csv"
            headers={['Position', 'Player', 'Team', 'Clean Sheets']}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cleanSheets.length > 0 ? (
            cleanSheets.map((player: any, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary-surface/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted font-semibold w-6">#{index + 1}</span>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-muted">{player.team}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{player.cleanSheets}</div>
              </div>
            ))
          ) : (
            <p className="text-muted">No clean sheets data available</p>
          )}
        </div>
      </Card>
    </div>
  )
}

