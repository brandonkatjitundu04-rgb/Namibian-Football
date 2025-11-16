'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import Image from 'next/image'
import { useGender } from '@/lib/gender-context'

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Center Back',
  LB: 'Left Back',
  RB: 'Right Back',
  CDM: 'Def. Midfielder',
  CM: 'Center Mid',
  LM: 'Left Mid',
  RM: 'Right Mid',
  CAM: 'Att. Midfielder',
  LW: 'Left Winger',
  RW: 'Right Winger',
  CF: 'Center Forward',
  ST: 'Striker',
}

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-400',
  CB: 'bg-blue-500/20 text-blue-400',
  LB: 'bg-blue-500/20 text-blue-400',
  RB: 'bg-blue-500/20 text-blue-400',
  CDM: 'bg-green-500/20 text-green-400',
  CM: 'bg-green-500/20 text-green-400',
  LM: 'bg-green-500/20 text-green-400',
  RM: 'bg-green-500/20 text-green-400',
  CAM: 'bg-purple-500/20 text-purple-400',
  LW: 'bg-red-500/20 text-red-400',
  RW: 'bg-red-500/20 text-red-400',
  CF: 'bg-red-500/20 text-red-400',
  ST: 'bg-red-500/20 text-red-400',
}

interface Team {
  id: string
  name: string
  crestUrl?: string
  gender: string
}

interface Player {
  id: string
  teamId: string
  firstName: string
  lastName: string
  position: string
  shirtNumber?: number
  photoUrl?: string
  squadStatus?: string
}

export default function PlayersPage() {
  const { gender } = useGender()
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const teamsRes = await fetch(`/api/teams?gender=${gender}`)
        const teamsData = await teamsRes.json()
        const teamsArray = Array.isArray(teamsData) ? teamsData : []
        setTeams(teamsArray)

        // Fetch players for all teams (players don't have gender, inherited from team)
        const playersPromises = teamsArray.map((team: Team) =>
          fetch(`/api/players?teamId=${team.id}`).then(r => r.json())
        )
        const playersArrays = await Promise.all(playersPromises)
        const allPlayers = playersArrays.flat().filter(p => p && typeof p === 'object')
        setPlayers(allPlayers)
      } catch (error) {
        console.error('Error fetching players:', error)
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
          <p className="text-muted">Loading players...</p>
        </Card>
      </div>
    )
  }

  const playersByTeam = teams.map(team => ({
    team,
    players: players.filter(p => p.teamId === team.id)
  })).filter(group => group.players.length > 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {gender === 'FEMALE' ? "Women's" : "Men's"} Players
        </h1>
        <p className="text-muted text-lg">
          Browse all players in Namibian {gender === 'FEMALE' ? "women's" : "men's"} football
        </p>
      </div>

      {playersByTeam.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted text-lg">
            No players available for {gender === 'FEMALE' ? "women's" : "men's"} football yet
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {playersByTeam.map(({ team, players }) => {
            const sortedPlayers = [...players].sort((a, b) => {
              const squadOrder = { FIRST_TEAM: 1, RESERVE: 2 }
              const aSquad = squadOrder[a.squadStatus as keyof typeof squadOrder] || 1
              const bSquad = squadOrder[b.squadStatus as keyof typeof squadOrder] || 1
              if (aSquad !== bSquad) return aSquad - bSquad

              const posOrder: Record<string, number> = { 
                GK: 1, CB: 2, LB: 3, RB: 4, CDM: 5, CM: 6, LM: 7, RM: 8, CAM: 9,
                LW: 10, RW: 11, CF: 12, ST: 13
              }
              const aPos = posOrder[a.position] || 99
              const bPos = posOrder[b.position] || 99
              if (aPos !== bPos) return aPos - bPos

              return (a.shirtNumber || 999) - (b.shirtNumber || 999)
            })

            return (
              <div key={team.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {team.crestUrl && (
                      <div className="w-8 h-8 relative">
                        <Image src={team.crestUrl} alt={team.name} fill className="object-contain" />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold">{team.name}</h2>
                  </div>
                  <Link href={`/team/${team.id}`} className="text-accent-400 hover:text-accent-300 transition-colors text-sm">
                    View Team →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedPlayers.map((player) => (
                    <Link key={player.id} href={`/player/${player.id}`}>
                      <Card className="p-4 hover:bg-secondary-surface/50 transition-all hover:scale-105 cursor-pointer">
                        <div className="flex items-center gap-4">
                          {player.photoUrl ? (
                            <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
                              <Image src={player.photoUrl} alt={`${player.firstName} ${player.lastName}`} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-secondary-surface flex items-center justify-center flex-shrink-0">
                              <span className="text-xl font-bold">
                                {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {player.shirtNumber && (
                                <span className="font-bold text-accent-400">#{player.shirtNumber}</span>
                              )}
                              <h3 className="font-semibold truncate">
                                {player.firstName} {player.lastName}
                              </h3>
                            </div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${POSITION_COLORS[player.position] || 'bg-gray-500/20 text-gray-400'}`}>
                              {POSITION_LABELS[player.position] || player.position}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
