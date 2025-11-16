import { notFound } from 'next/navigation'
import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { calculateAge, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

async function getTeamData(teamId: string) {
  const team = await firestore.team.findUnique(teamId, {
    include: {
      league: true,
      players: true,
      staff: true,
      tableRow: true,
    },
  })

  if (!team) return null

  // Get fixtures separately
  const homeFixtures = await firestore.fixture.findMany(
    { homeTeamId: teamId },
    {
      include: {
        awayTeam: true,
        league: true,
      },
      orderBy: {
        kickoff: 'desc',
      },
      take: 10,
    }
  )

  const awayFixtures = await firestore.fixture.findMany(
    { awayTeamId: teamId },
    {
      include: {
        homeTeam: true,
        league: true,
      },
      orderBy: {
        kickoff: 'desc',
      },
      take: 10,
    }
  )

  return {
    ...team,
    homeFixtures,
    awayFixtures,
  }
}

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const team = await getTeamData(params.teamId)

  if (!team) {
    notFound()
  }

  const allFixtures = [...team.homeFixtures, ...team.awayFixtures].sort(
    (a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime()
  )

  const positionLabels: Record<string, string> = {
    GK: 'Goalkeeper',
    CB: 'Center Back',
    LB: 'Left Back',
    RB: 'Right Back',
    CDM: 'Defensive Midfielder',
    CM: 'Center Midfielder',
    LM: 'Left Midfielder',
    RM: 'Right Midfielder',
    CAM: 'Attacking Midfielder',
    LW: 'Left Winger',
    RW: 'Right Winger',
    CF: 'Center Forward',
    ST: 'Striker',
  }

  // Group players by squad status (default to FIRST_TEAM if not set for backward compatibility)
  const firstTeamPlayers = team.players?.filter(p => !p.squadStatus || p.squadStatus === 'FIRST_TEAM') || []
  const reservePlayers = team.players?.filter(p => p.squadStatus === 'RESERVE') || []

  const staffRoleLabels: Record<string, string> = {
    MANAGER: 'Manager',
    COACH: 'Coach',
    ASSISTANT_COACH: 'Assistant Coach',
    PHYSIO: 'Physiotherapist',
    OTHER: 'Other',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Team Header */}
      <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {team.crestUrl && (
            <div className="w-24 h-24 relative">
              <Image
                src={team.crestUrl}
                alt={`${team.name} crest`}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
            <div className="space-y-2 text-muted">
              {team.stadium && <p>🏟️ {team.stadium}</p>}
              {team.founded && <p>Founded: {team.founded}</p>}
              {team.tableRow && (
                <p>
                  League Position: <span className="text-foreground font-semibold">#{team.tableRow.position}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Squad</h2>
            
            {/* First Team */}
            {firstTeamPlayers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-accent-400">First Team</h3>
                <div className="space-y-6">
                  {[
                    { positions: ['GK'], label: 'Goalkeepers' },
                    { positions: ['CB', 'LB', 'RB'], label: 'Defenders' },
                    { positions: ['CDM', 'CM', 'LM', 'RM', 'CAM'], label: 'Midfielders' },
                    { positions: ['LW', 'RW', 'CF', 'ST'], label: 'Forwards' },
                  ].map((group) => {
                    const playersInGroup = firstTeamPlayers.filter((p) => 
                      group.positions.includes(p.position)
                    )
                    if (playersInGroup.length === 0) return null

                    return (
                      <div key={group.label}>
                        <h4 className="text-sm font-semibold mb-3 text-muted uppercase">
                          {group.label}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {playersInGroup.map((player) => (
                            <Link
                              key={player.id}
                              href={`/player/${player.id}`}
                              className="flex items-center gap-3 p-3 rounded-xl bg-secondary-surface/30 hover:bg-secondary-surface/50 transition-colors"
                            >
                              {player.photoUrl && (
                                <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
                                  <Image
                                    src={player.photoUrl}
                                    alt={`${player.firstName} ${player.lastName}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold">
                                  {player.shirtNumber && (
                                    <span className="text-accent-400 mr-2">#{player.shirtNumber}</span>
                                  )}
                                  {player.firstName} {player.lastName}
                                </div>
                                <div className="text-xs text-muted">
                                  {positionLabels[player.position] || player.position}
                                  {player.dob && ` • Age ${calculateAge(player.dob)}`}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reserve Squad */}
            {reservePlayers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-muted">Reserve Squad</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reservePlayers.map((player) => (
                    <Link
                      key={player.id}
                      href={`/player/${player.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary-surface/20 hover:bg-secondary-surface/40 transition-colors"
                    >
                      {player.photoUrl && (
                        <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={player.photoUrl}
                            alt={`${player.firstName} ${player.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">
                          {player.shirtNumber && (
                            <span className="text-muted mr-2">#{player.shirtNumber}</span>
                          )}
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-xs text-muted">
                          {positionLabels[player.position] || player.position}
                          {player.dob && ` • Age ${calculateAge(player.dob)}`}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {team.players.length === 0 && (
              <p className="text-muted text-center py-8">No players in squad</p>
            )}
          </Card>

          {/* Staff */}
          {team.staff.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Staff</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary-surface/30"
                  >
                    {member.photoUrl && (
                      <div className="w-12 h-12 relative rounded-full overflow-hidden">
                        <Image
                          src={member.photoUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-muted">
                        {staffRoleLabels[member.role]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Fixtures */}
        <div>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Fixtures</h2>
            {allFixtures.length > 0 ? (
              <div className="space-y-4">
                {allFixtures.slice(0, 10).map((fixture) => {
                  const isHome = fixture.homeTeamId === team.id
                  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam
                  const teamScore = isHome ? fixture.homeScore : fixture.awayScore
                  const opponentScore = isHome ? fixture.awayScore : fixture.homeScore

                  return (
                    <div
                      key={fixture.id}
                      className="border-b border-secondary-surface/50 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="text-xs text-muted mb-2">
                        {formatDate(fixture.kickoff)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">
                            {isHome ? 'vs' : '@'} {opponent.shortName}
                          </div>
                          {fixture.status === 'FINISHED' && (
                            <div className="text-sm text-muted">
                              {teamScore} - {opponentScore}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  )
                })}
              </div>
            ) : (
              <p className="text-muted">No fixtures available</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

