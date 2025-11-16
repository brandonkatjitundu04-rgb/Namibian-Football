import { notFound } from 'next/navigation'
import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { calculateAge, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

async function getPlayerData(playerId: string) {
  const player = await firestore.player.findUnique(playerId, {
    include: {
      team: {
        include: {
          league: true,
        },
      },
      matchEvents: {
        include: {
          fixture: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
        orderBy: {
          fixture: {
            kickoff: 'desc',
          },
        },
      },
    },
  })

  if (!player) return null

  // Calculate stats
  const goals = player.matchEvents?.filter((e: any) => e.type === 'GOAL').length || 0
  const assists = player.matchEvents?.filter((e: any) => e.type === 'ASSIST').length || 0
  const yellowCards = player.matchEvents?.filter((e: any) => e.type === 'YELLOW_CARD').length || 0
  const redCards = player.matchEvents?.filter((e: any) => e.type === 'RED_CARD').length || 0

  return {
    player,
    stats: {
      goals,
      assists,
      yellowCards,
      redCards,
      appearances: new Set(player.matchEvents?.map((e: any) => e.fixtureId) || []).size,
    },
  }
}

export default async function PlayerPage({ params }: { params: { playerId: string } }) {
  const data = await getPlayerData(params.playerId)

  if (!data) {
    notFound()
  }

  const { player, stats } = data

  const positionLabels: Record<string, string> = {
    GK: 'Goalkeeper',
    DF: 'Defender',
    MF: 'Midfielder',
    FW: 'Forward',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Player Header */}
      <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {player.photoUrl && (
            <div className="w-32 h-32 relative rounded-full overflow-hidden">
              <Image
                src={player.photoUrl}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {player.firstName} {player.lastName}
            </h1>
            <div className="space-y-2 text-muted">
              <p>
                <Link
                  href={`/team/${player.team.id}`}
                  className="text-accent-400 hover:text-accent-300"
                >
                  {player.team.shortName}
                </Link>
                {' • '}
                {positionLabels[player.position]}
                {player.shirtNumber && ` • #${player.shirtNumber}`}
              </p>
              {player.dob && (
                <p>
                  Age: {calculateAge(player.dob)} • Born: {formatDate(player.dob)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Season Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary-surface/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold-500">{stats.goals}</div>
                <div className="text-sm text-muted mt-1">Goals</div>
              </div>
              <div className="bg-secondary-surface/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-accent-400">{stats.assists}</div>
                <div className="text-sm text-muted mt-1">Assists</div>
              </div>
              <div className="bg-secondary-surface/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{stats.appearances}</div>
                <div className="text-sm text-muted mt-1">Appearances</div>
              </div>
              <div className="bg-secondary-surface/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.yellowCards}</div>
                <div className="text-sm text-muted mt-1">Yellow Cards</div>
              </div>
            </div>
          </Card>

          {/* Match Log */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Match Log</h2>
            {player.matchEvents.length > 0 ? (
              <div className="space-y-4">
                {player.matchEvents.map((event: any) => {
                  const fixture = event.fixture
                  const isHome = fixture.homeTeamId === player.teamId
                  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam

                  return (
                    <div
                      key={event.id}
                      className="border-b border-secondary-surface/50 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">
                            {isHome ? 'vs' : '@'} {opponent.shortName}
                          </div>
                          <div className="text-sm text-muted">
                            {formatDate(fixture.kickoff)} • {event.minute}&apos;
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.type === 'GOAL'
                              ? 'bg-green-500/20 text-green-400'
                              : event.type === 'ASSIST'
                              ? 'bg-blue-500/20 text-blue-400'
                              : event.type === 'YELLOW_CARD'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted">No match events recorded</p>
            )}
          </Card>
        </div>

        {/* Team Info */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Team</h2>
            <Link
              href={`/team/${player.team.id}`}
              className="block p-4 rounded-xl bg-secondary-surface/30 hover:bg-secondary-surface/50 transition-colors"
            >
              <div className="font-semibold text-lg">{player.team.name}</div>
              <div className="text-sm text-muted mt-1">{player.team.league.name}</div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

