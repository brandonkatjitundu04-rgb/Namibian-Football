import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

// Revalidate every 30 seconds for live fixture updates
export const revalidate = 30

async function getFixtures() {
  const fixtures = await firestore.fixture.findMany(
    undefined,
    {
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
      orderBy: {
        kickoff: 'asc',
      },
    }
  )

  return fixtures
}

export default async function FixturesPage() {
  const fixtures = await getFixtures()

  const groupedFixtures = fixtures.reduce((acc, fixture) => {
    const date = new Date(fixture.kickoff).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(fixture)
    return acc
  }, {} as Record<string, typeof fixtures>)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Fixtures & Results</h1>

      {Object.entries(groupedFixtures).map(([date, dateFixtures]) => (
        <Card key={date} className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{date}</h2>
          <div className="space-y-4">
            {dateFixtures.map((fixture) => (
              <Link
                key={fixture.id}
                href={`/fixture/${fixture.id}`}
                className="block border-b border-secondary-surface/50 pb-4 last:border-0 last:pb-0 hover:bg-secondary-surface/30 rounded-lg p-4 -mx-4 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold text-lg">{fixture.homeTeam.shortName}</span>
                      {fixture.status === 'FINISHED' && (
                        <span className="text-2xl font-bold">
                          {fixture.homeScore} - {fixture.awayScore}
                        </span>
                      )}
                      {fixture.status === 'SCHEDULED' && (
                        <span className="text-muted">vs</span>
                      )}
                      {fixture.status === 'LIVE' && (
                        <span className="text-2xl font-bold text-red-400 animate-pulse">
                          {fixture.homeScore} - {fixture.awayScore}
                        </span>
                      )}
                      <span className="font-semibold text-lg">{fixture.awayTeam.shortName}</span>
                    </div>
                    <div className="text-sm text-muted space-x-4">
                      <span>{formatDateTime(fixture.kickoff)}</span>
                      {fixture.venue && <span>• {fixture.venue}</span>}
                      <span>• {fixture.league.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fixture.status === 'FINISHED'
                          ? 'bg-green-500/20 text-green-400'
                          : fixture.status === 'LIVE'
                          ? 'bg-red-500/20 text-red-400 animate-pulse'
                          : fixture.status === 'POSTPONED'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-secondary-surface text-muted'
                      }`}
                    >
                      {fixture.status}
                    </span>
                    <span className="text-accent-400 text-sm">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

