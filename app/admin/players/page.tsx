import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

async function getPlayers() {
  const players = await firestore.player.findMany()
  const teams = await firestore.team.findMany()
  
  return players.map(player => ({
    ...player,
    team: teams.find(t => t.id === player.teamId),
  }))
}

export default async function PlayersAdminPage() {
  const players = await getPlayers()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Manage Players</h1>
        <Link href="/admin/players/new">
          <Button>Add New Player</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Name</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Position</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Shirt #</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Team</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                >
                  <td className="py-3 px-2 font-medium">
                    {player.firstName} {player.lastName}
                  </td>
                  <td className="py-3 px-2">{player.position}</td>
                  <td className="py-3 px-2 text-center">{player.shirtNumber || '-'}</td>
                  <td className="py-3 px-2">{player.team?.shortName || '-'}</td>
                  <td className="py-3 px-2 text-center">
                    <Link href={`/player/${player.id}`}>
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

