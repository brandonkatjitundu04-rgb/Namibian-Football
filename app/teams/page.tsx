'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import Image from 'next/image'
import { useGender } from '@/lib/gender-context'

interface League {
  id: string
  name: string
  tier: string
  gender: string
}

interface Team {
  id: string
  name: string
  shortName: string
  crestUrl?: string
  stadium?: string
  founded?: number
  leagueId: string
}

export default function TeamsPage() {
  const { gender } = useGender()
  const [teams, setTeams] = useState<Team[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [teamsRes, leaguesRes] = await Promise.all([
          fetch(`/api/teams?gender=${gender}`),
          fetch(`/api/leagues?gender=${gender}`)
        ])
        
        const teamsData = await teamsRes.json()
        const leaguesData = await leaguesRes.json()
        
        setTeams(Array.isArray(teamsData) ? teamsData : [])
        setLeagues(Array.isArray(leaguesData) ? leaguesData : [])
      } catch (error) {
        console.error('Error fetching teams:', error)
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
          <p className="text-muted">Loading teams...</p>
        </Card>
      </div>
    )
  }

  // Group teams by league
  const teamsByLeague = leagues.map(league => ({
    league,
    teams: teams.filter(team => team.leagueId === league.id)
  })).filter(group => group.teams.length > 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {gender === 'FEMALE' ? "Women's" : "Men's"} Teams
        </h1>
        <p className="text-muted text-lg">
          Browse all teams in Namibian {gender === 'FEMALE' ? "women's" : "men's"} football
        </p>
      </div>

      {teamsByLeague.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted text-lg">
            No teams available for {gender === 'FEMALE' ? "women's" : "men's"} football yet
          </p>
        </Card>
      ) : (
        <div className="space-y-12">
          {teamsByLeague.map(({ league, teams }) => (
            <div key={league.id}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{league.name}</h2>
                <Link
                  href={`/league/${league.id}`}
                  className="text-accent-400 hover:text-accent-300 transition-colors text-sm"
                >
                  View League →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teams.map((team) => (
                  <Link key={team.id} href={`/team/${team.id}`}>
                    <Card className="p-6 hover:bg-secondary-surface/50 transition-all hover:scale-105 cursor-pointer text-center">
                      {team.crestUrl ? (
                        <div className="w-24 h-24 mx-auto mb-4 relative">
                          <Image
                            src={team.crestUrl}
                            alt={team.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary-surface flex items-center justify-center">
                          <span className="text-3xl font-bold">{team.shortName.charAt(0)}</span>
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                      {team.stadium && (
                        <p className="text-sm text-muted mb-1">📍 {team.stadium}</p>
                      )}
                      {team.founded && (
                        <p className="text-sm text-muted">Founded: {team.founded}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
