'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { GenderToggle } from '@/components/GenderToggle'
import { useGender } from '@/lib/gender-context'

interface League {
  id: string
  name: string
  season: string
  tier: string
  tableRows?: any[]
}

export default function AllTablesPage() {
  const { gender } = useGender()
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leagues?gender=${gender}`)
        const leaguesData = await res.json()
        
        // Fetch table rows for each league
        const leaguesWithTables = await Promise.all(
          (leaguesData || []).map(async (league: League) => {
            try {
              const tableRes = await fetch(`/api/leagues/${league.id}/table`)
              const tableData = await tableRes.json()
              
              // If no table rows, get teams and create default rows
              if (!tableData || tableData.length === 0) {
                const teamsRes = await fetch(`/api/teams?leagueId=${league.id}`)
                const teamsData = await teamsRes.json()
                
                return {
                  ...league,
                  tableRows: (teamsData || []).map((team: any, index: number) => ({
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
                  })),
                }
              }
              
              return {
                ...league,
                tableRows: tableData || [],
              }
            } catch (error) {
              console.error(`Error fetching table for league ${league.id}:`, error)
              return { ...league, tableRows: [] }
            }
          })
        )
        
        setLeagues(leaguesWithTables)
      } catch (error) {
        console.error('Error fetching leagues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [gender])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading league tables...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">
            {gender === 'FEMALE' ? "Women's" : "Men's"} League Tables
          </h1>
          <GenderToggle />
        </div>
        <p className="text-muted text-lg">
          View all league tables for {gender === 'FEMALE' ? "women's" : "men's"} football
        </p>
      </div>

      {/* Legend */}
      <Card className="p-4 mb-8">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
            <span className="text-muted">CAF Champions League (Top 2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
            <span className="text-muted">Relegation Zone (Bottom 3)</span>
          </div>
        </div>
      </Card>

      {leagues.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted text-lg">
            No leagues available for {gender === 'FEMALE' ? "women's" : "men's"} football yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-12">
          {leagues.map((league: any) => {
            const totalTeams = league.tableRows?.length || 0
            
            return (
              <div key={league.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{league.name}</h2>
                    <p className="text-muted">{league.season}</p>
                  </div>
                  <Link
                    href={`/league/${league.id}`}
                    className="text-accent-400 hover:text-accent-300 transition-colors text-sm"
                  >
                    View Full League →
                  </Link>
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
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted">GF</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted">GA</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted">GD</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {league.tableRows && league.tableRows.length > 0 ? (
                          league.tableRows.map((row: any) => {
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
                                <td className="py-3 px-4 font-semibold">
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
                                    className="hover:text-accent-400 transition-colors font-medium"
                                  >
                                    {row.team?.shortName || row.team?.name || 'Unknown Team'}
                                  </Link>
                                </td>
                                <td className="py-3 px-4 text-center">{row.played || 0}</td>
                                <td className="py-3 px-4 text-center">{row.won || 0}</td>
                                <td className="py-3 px-4 text-center">{row.drawn || 0}</td>
                                <td className="py-3 px-4 text-center">{row.lost || 0}</td>
                                <td className="py-3 px-4 text-center">{row.goalsFor || 0}</td>
                                <td className="py-3 px-4 text-center">{row.goalsAgainst || 0}</td>
                                <td className="py-3 px-4 text-center">
                                  {(row.goalDifference || 0) > 0 ? '+' : ''}
                                  {row.goalDifference || 0}
                                </td>
                                <td className="py-3 px-4 text-center font-semibold">{row.points || 0}</td>
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

