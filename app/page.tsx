'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Advertisement } from '@/components/Advertisement'
import { useGender } from '@/lib/gender-context'

interface HomeData {
  league: any
  upcomingFixtures: any[]
  recentResults: any[]
}

export default function Home() {
  const { gender } = useGender()
  const [data, setData] = useState<HomeData>({ league: null, upcomingFixtures: [], recentResults: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/home?gender=${gender}`)
        const homeData = await res.json()
        setData(homeData)
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gender])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading...</p>
        </Card>
      </div>
    )
  }

  const { league, upcomingFixtures, recentResults } = data
  const safeUpcomingFixtures = Array.isArray(upcomingFixtures) ? upcomingFixtures : []
  const safeRecentResults = Array.isArray(recentResults) ? recentResults : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Namibian {gender === 'FEMALE' ? "Women's" : "Men's"} Football League
        </h1>
        <p className="text-xl text-muted">
          Live league tables, fixtures, results, and statistics
        </p>
      </div>

      {/* League Table Preview */}
      {league ? (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">{league.name} - Table</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/50 rounded"></div>
                <span>CAF CL</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></div>
                <span>Relegation</span>
              </div>
              <Link
                href={`/league/${league.id}`}
                className="text-accent-400 hover:text-accent-300 transition-colors"
              >
                View Full Table →
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-surface/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Pos</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Team</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted">P</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted">W</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted">D</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted">L</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted">GD</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {league.tableRows && league.tableRows.length > 0 ? (
                    league.tableRows.map((row: any, index: number) => {
                      const totalTeams = league.tableRows.length
                      const isCAFChampionsLeague = row.position <= 2
                      const isRelegationZone = row.position > totalTeams - 3
                      
                      return (
                        <tr 
                          key={row.id} 
                          className={`border-t border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors ${
                            isCAFChampionsLeague ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : 
                            isRelegationZone ? 'bg-red-500/10 border-l-4 border-l-red-500' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold">
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
                          <td className="py-3 px-4">
                            <Link
                              href={`/team/${row.team?.id || row.teamId}`}
                              className="hover:text-accent-400 transition-colors"
                            >
                              {row.team?.name || row.team?.shortName || 'Unknown Team'}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-center">{row.played || 0}</td>
                          <td className="py-3 px-4 text-center">{row.won || 0}</td>
                          <td className="py-3 px-4 text-center">{row.drawn || 0}</td>
                          <td className="py-3 px-4 text-center">{row.lost || 0}</td>
                          <td className="py-3 px-4 text-center">{row.goalDifference || 0}</td>
                          <td className="py-3 px-4 text-center font-bold">{row.points || 0}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted">
                        No teams in this league yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">League Table</h2>
          <Card className="p-8 text-center">
            <p className="text-muted">No league found for {gender === 'FEMALE' ? "women's" : "men's"} football yet.</p>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming Fixtures */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming Fixtures</h2>
            <Link
              href="/fixtures"
              className="text-accent-400 hover:text-accent-300 transition-colors text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {safeUpcomingFixtures.length > 0 ? (
              safeUpcomingFixtures.map((fixture) => (
                <Link key={fixture.id} href={`/fixture/${fixture.id}`}>
                  <Card className="p-4 hover:bg-secondary-surface/50 transition-colors cursor-pointer">
                    <div className="text-xs text-muted mb-2">{formatDate(fixture.kickoff)}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">{fixture.homeTeam?.name || 'TBD'}</div>
                      <div className="px-4 text-muted">vs</div>
                      <div className="flex-1 text-right">{fixture.awayTeam?.name || 'TBD'}</div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted">No upcoming fixtures</p>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Results</h2>
            <Link
              href="/fixtures"
              className="text-accent-400 hover:text-accent-300 transition-colors text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {safeRecentResults.length > 0 ? (
              safeRecentResults.map((fixture) => (
                <Link key={fixture.id} href={`/fixture/${fixture.id}`}>
                  <Card className="p-4 hover:bg-secondary-surface/50 transition-colors cursor-pointer">
                    <div className="text-xs text-muted mb-2">{formatDate(fixture.kickoff)}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">{fixture.homeTeam?.name || 'TBD'}</div>
                      <div className="px-4 font-bold">
                        {fixture.homeScore} - {fixture.awayScore}
                      </div>
                      <div className="flex-1 text-right">{fixture.awayTeam?.name || 'TBD'}</div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted">No recent results</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
