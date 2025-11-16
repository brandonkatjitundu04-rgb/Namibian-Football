import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

async function getLeagues() {
  return await firestore.league.findMany(undefined, {
    orderBy: {
      tier: 'asc',
    },
  })
}

export default async function LeaguesAdminPage() {
  const leagues = await getLeagues()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Manage Leagues</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/leagues/new">
            <Button>Add New League</Button>
          </Link>
          <Link href="/admin" className="text-accent-400 hover:text-accent-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Logo</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Name</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Season</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Tier</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Win Points</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Draw Points</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leagues.map((league) => (
                <tr
                  key={league.id}
                  className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                >
                  <td className="py-3 px-2">
                    {league.logoUrl ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-surface flex items-center justify-center">
                        <img 
                          src={league.logoUrl} 
                          alt={`${league.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary-surface flex items-center justify-center">
                        <span className="text-xs text-muted">No logo</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 font-medium">{league.name}</td>
                  <td className="py-3 px-2">{league.season}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary-surface text-muted">
                      {league.tier}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">{league.winPoints}</td>
                  <td className="py-3 px-2 text-center">{league.drawPoints}</td>
                  <td className="py-3 px-2 text-center">
                    <Link href={`/admin/leagues/${league.id}/table`}>
                      <Button variant="outline" size="sm">
                        Manage Table
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

