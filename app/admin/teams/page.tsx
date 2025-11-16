import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

async function getTeams() {
  const teams = await firestore.team.findMany()
  const leagues = await firestore.league.findMany()
  
  return (teams as any[]).map((team: any) => ({
    ...team,
    league: (leagues as any[]).find((l: any) => l.id === team.leagueId),
  }))
}

export default async function TeamsAdminPage() {
  const teams = await getTeams()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Manage Teams</h1>
        <Link href="/admin/teams/new">
          <Button>Add New Team</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Name</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Short Name</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Stadium</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">League</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Founded</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                >
                  <td className="py-3 px-2 font-medium">{team.name}</td>
                  <td className="py-3 px-2">{team.shortName}</td>
                  <td className="py-3 px-2">{team.stadium || '-'}</td>
                  <td className="py-3 px-2">{team.league?.name || '-'}</td>
                  <td className="py-3 px-2 text-center">{team.founded || '-'}</td>
                  <td className="py-3 px-2 text-center">
                    <Link href={`/team/${team.id}`}>
                      <Button variant="outline" size="sm">
                        View
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

