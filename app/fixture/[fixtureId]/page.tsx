import { notFound } from 'next/navigation'
import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

async function getFixtureData(fixtureId: string) {
  const fixture = await firestore.fixture.findUnique(fixtureId, {
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  })

  if (!fixture) return null

  // Get match events separately
  const events = await firestore.matchEvent.findMany(
    { fixtureId },
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

  // Sort by minute
  events.sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0))

  return {
    ...fixture,
    events,
  }
}

export default async function FixturePage({ params }: { params: { fixtureId: string } }) {
  const fixture = await getFixtureData(params.fixtureId)

  if (!fixture) {
    notFound()
  }

  const statusColors = {
    SCHEDULED: 'bg-secondary-surface text-muted',
    LIVE: 'bg-red-500/20 text-red-400',
    FINISHED: 'bg-green-500/20 text-green-400',
    POSTPONED: 'bg-yellow-500/20 text-yellow-400',
  }

  const eventIcons = {
    GOAL: '⚽',
    YELLOW_CARD: '🟨',
    RED_CARD: '🟥',
    SUBSTITUTION: '🔄',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Match Header */}
      <Card className="p-8 mb-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link 
              href={`/league/${fixture.league.id}`}
              className="text-accent-400 hover:text-accent-300 transition-colors"
            >
              {fixture.league.name}
            </Link>
            <span className="text-muted">•</span>
            <span className="text-muted">{fixture.league.season}</span>
          </div>
          <div className="text-lg text-muted mb-4">{formatDateTime(fixture.kickoff)}</div>
          {fixture.venue && (
            <div className="text-sm text-muted mb-2">📍 {fixture.venue}</div>
          )}
          <div className="inline-block">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[fixture.status as keyof typeof statusColors]
              }`}
            >
              {fixture.status}
            </span>
          </div>
        </div>

        {/* Match Score */}
        <div className="grid grid-cols-3 items-center gap-8 max-w-4xl mx-auto">
          {/* Home Team */}
          <Link href={`/team/${fixture.homeTeam.id}`} className="text-center hover:opacity-80 transition-opacity">
            {fixture.homeTeam.crestUrl ? (
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src={fixture.homeTeam.crestUrl}
                  alt={fixture.homeTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary-surface flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {fixture.homeTeam.shortName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-1">{fixture.homeTeam.name}</h2>
            <p className="text-muted">{fixture.homeTeam.shortName}</p>
          </Link>

          {/* Score */}
          <div className="text-center">
            {fixture.status === 'SCHEDULED' ? (
              <div className="text-4xl font-bold text-muted">VS</div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl font-bold">{fixture.homeScore}</div>
                <div className="text-4xl text-muted">-</div>
                <div className="text-6xl font-bold">{fixture.awayScore}</div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <Link href={`/team/${fixture.awayTeam.id}`} className="text-center hover:opacity-80 transition-opacity">
            {fixture.awayTeam.crestUrl ? (
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src={fixture.awayTeam.crestUrl}
                  alt={fixture.awayTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary-surface flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {fixture.awayTeam.shortName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-1">{fixture.awayTeam.name}</h2>
            <p className="text-muted">{fixture.awayTeam.shortName}</p>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Events */}
        <div className="lg:col-span-2">
          {fixture.events && fixture.events.length > 0 && (
            <Card className="p-6 mb-6">
              <h3 className="text-2xl font-bold mb-6">Match Events</h3>
              <div className="space-y-4">
                {fixture.events.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary-surface/30"
                  >
                    <div className="text-2xl">{eventIcons[event.type as keyof typeof eventIcons]}</div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {event.player.firstName} {event.player.lastName}
                      </div>
                      <div className="text-sm text-muted">
                        {event.player.team.name} • {event.type.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-accent-400">{event.minute}&apos;</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Match Details */}
          {(fixture.referee || fixture.attendance || fixture.weather || fixture.notes) && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Match Details</h3>
              <div className="space-y-3">
                {fixture.referee && (
                  <div className="flex justify-between py-2 border-b border-secondary-surface/30">
                    <span className="text-muted">Referee</span>
                    <span className="font-medium">{fixture.referee}</span>
                  </div>
                )}
                {fixture.attendance && (
                  <div className="flex justify-between py-2 border-b border-secondary-surface/30">
                    <span className="text-muted">Attendance</span>
                    <span className="font-medium">{fixture.attendance.toLocaleString()}</span>
                  </div>
                )}
                {fixture.weather && (
                  <div className="flex justify-between py-2 border-b border-secondary-surface/30">
                    <span className="text-muted">Weather</span>
                    <span className="font-medium">{fixture.weather}</span>
                  </div>
                )}
                {fixture.notes && (
                  <div className="py-2">
                    <div className="text-muted mb-2">Notes</div>
                    <div className="text-foreground">{fixture.notes}</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Streaming & Tickets */}
        <div className="space-y-6">
          {fixture.streamingUrl && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Watch Live</h3>
              <a
                href={fixture.streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl text-center transition-colors"
              >
                🎥 Stream Match
              </a>
              <p className="text-xs text-muted mt-2 text-center">
                Opens in new window
              </p>
            </Card>
          )}

          {fixture.ticketUrl && fixture.status === 'SCHEDULED' && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Get Tickets</h3>
              <a
                href={fixture.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-center transition-colors"
              >
                🎫 Buy Tickets
              </a>
              <p className="text-xs text-muted mt-2 text-center">
                Opens in new window
              </p>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href={`/team/${fixture.homeTeam.id}`}
                className="block py-2 px-4 bg-secondary-surface/50 hover:bg-secondary-surface rounded-lg transition-colors"
              >
                {fixture.homeTeam.shortName} Profile →
              </Link>
              <Link
                href={`/team/${fixture.awayTeam.id}`}
                className="block py-2 px-4 bg-secondary-surface/50 hover:bg-secondary-surface rounded-lg transition-colors"
              >
                {fixture.awayTeam.shortName} Profile →
              </Link>
              <Link
                href={`/league/${fixture.league.id}`}
                className="block py-2 px-4 bg-secondary-surface/50 hover:bg-secondary-surface rounded-lg transition-colors"
              >
                {fixture.league.name} Table →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

