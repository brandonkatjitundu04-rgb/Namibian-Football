import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

async function getFixtures() {
  return await firestore.fixture.findMany(
    undefined,
    {
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
      orderBy: {
        kickoff: 'desc',
      },
    }
  )
}

export default async function FixturesAdminPage() {
  const fixtures = await getFixtures()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Manage Fixtures</h1>
        <Link href="/admin/fixtures/new">
          <Button>Create New Fixture</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Date</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Home Team</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Away Team</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Score</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Status</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((fixture) => (
                <tr
                  key={fixture.id}
                  className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                >
                  <td className="py-3 px-2">{formatDateTime(fixture.kickoff)}</td>
                  <td className="py-3 px-2 font-medium">{fixture.homeTeam.shortName}</td>
                  <td className="py-3 px-2 font-medium">{fixture.awayTeam.shortName}</td>
                  <td className="py-3 px-2 text-center">
                    {fixture.status === 'FINISHED' || fixture.status === 'LIVE' ? (
                      <span className="font-bold">
                        {fixture.homeScore} - {fixture.awayScore}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
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
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Link href={`/admin/fixtures/${fixture.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

