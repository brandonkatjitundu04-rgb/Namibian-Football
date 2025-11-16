import { notFound } from 'next/navigation'
import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

// Revalidate every 60 seconds for live table updates
export const revalidate = 60

async function getLeagueData(leagueId: string) {
  const league = await firestore.league.findUnique(leagueId, {
    include: {
      tableRows: {
        include: {
          team: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
      fixtures: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: {
          kickoff: 'asc',
        },
        take: 10,
      },
    },
  })

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

  return league
}

export default async function LeaguePage({ params }: { params: { leagueId: string } }) {
  const league = await getLeagueData(params.leagueId)

  if (!league) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{league.name}</h1>
        <p className="text-muted text-lg">{league.season}</p>
      </div>

      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">League Table</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
              <span className="text-muted">CAF Champions League (Top 2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
              <span className="text-muted">Relegation Zone (Bottom 3)</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Pos</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Team</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">P</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">W</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">D</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">L</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">GF</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">GA</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">GD</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Pts</th>
              </tr>
            </thead>
            <tbody>
              {league.tableRows && league.tableRows.length > 0 ? (
                league.tableRows.map((row: any) => {
                  const totalTeams = league.tableRows.length
                  const isCAFChampionsLeague = row.position <= 2
                  const isRelegationZone = row.position > totalTeams - 3
                  
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors ${
                        isCAFChampionsLeague ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : 
                        isRelegationZone ? 'bg-red-500/10 border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <td className="py-3 px-2 font-semibold">
                        <div className="flex items-center gap-2">
                          {row.position}
                          {isCAFChampionsLeague && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                              CAF CL
                            </span>
                          )}
                          {isRelegationZone && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                              R
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/team/${row.team?.id || row.teamId}`}
                          className="hover:text-accent-400 transition-colors font-medium"
                        >
                          {row.team?.shortName || row.team?.name || 'Unknown Team'}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-center">{row.played || 0}</td>
                      <td className="py-3 px-2 text-center">{row.won || 0}</td>
                      <td className="py-3 px-2 text-center">{row.drawn || 0}</td>
                      <td className="py-3 px-2 text-center">{row.lost || 0}</td>
                      <td className="py-3 px-2 text-center">{row.goalsFor || 0}</td>
                      <td className="py-3 px-2 text-center">{row.goalsAgainst || 0}</td>
                      <td className="py-3 px-2 text-center">
                        {(row.goalDifference || 0) > 0 ? '+' : ''}
                        {row.goalDifference || 0}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-lg">{row.points || 0}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted">
                    No teams in this league yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Fixtures</h2>
        {league.fixtures.length > 0 ? (
          <div className="space-y-4">
            {league.fixtures.map((fixture: any) => (
              <div
                key={fixture.id}
                className="border-b border-secondary-surface/50 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{fixture.homeTeam.shortName}</span>
                      {fixture.status === 'FINISHED' && (
                        <span className="text-2xl font-bold">
                          {fixture.homeScore} - {fixture.awayScore}
                        </span>
                      )}
                      {fixture.status === 'SCHEDULED' && (
                        <span className="text-muted">vs</span>
                      )}
                      <span className="font-semibold">{fixture.awayTeam.shortName}</span>
                    </div>
                    <div className="text-sm text-muted mt-1">
                      {new Date(fixture.kickoff).toLocaleDateString()} • {fixture.venue}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      fixture.status === 'FINISHED'
                        ? 'bg-green-500/20 text-green-400'
                        : fixture.status === 'LIVE'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-secondary-surface text-muted'
                    }`}
                  >
                    {fixture.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No fixtures available</p>
        )}
      </Card>
    </div>
  )
}

