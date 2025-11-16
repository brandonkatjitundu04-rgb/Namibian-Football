import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { signOut } from 'next-auth/react'
import { LogoutButton } from '@/components/admin/LogoutButton'

async function getAdminStats() {
  const [leagues, teams, players, fixtures, sponsors, articles] = await Promise.all([
    firestore.league.findMany().then(r => r.length),
    firestore.team.findMany().then(r => r.length),
    firestore.player.findMany().then(r => r.length),
    firestore.fixture.findMany().then(r => r.length),
    firestore.sponsor.findMany().then(r => r.length),
    firestore.article.findMany().then(r => r.length),
  ])

  return { leagues, teams, players, fixtures, sponsors, articles }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getAdminStats()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted">Welcome, {session?.user?.name || session?.user?.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{stats.leagues}</div>
          <div className="text-muted">Leagues</div>
          <Link href="/admin/leagues" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
            Manage →
          </Link>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{stats.teams}</div>
          <div className="text-muted">Teams</div>
          <Link href="/admin/teams" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
            Manage →
          </Link>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{stats.players}</div>
          <div className="text-muted">Players</div>
          <Link href="/admin/players" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
            Manage →
          </Link>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{stats.fixtures}</div>
          <div className="text-muted">Fixtures</div>
          <Link href="/admin/fixtures" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
            Manage →
          </Link>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{stats.sponsors}</div>
          <div className="text-muted">Sponsors</div>
          <Link href="/admin/sponsors" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
            Manage →
          </Link>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{stats.articles}</div>
          <div className="text-muted">News Articles</div>
          <Link href="/admin/articles" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
            Manage →
          </Link>
        </Card>
        {session?.user?.role === 'SUPER_ADMIN' && (
          <Card className="p-6">
            <div className="text-3xl font-bold mb-2">👥</div>
            <div className="text-muted">Users</div>
            <Link href="/admin/users" className="text-accent-400 hover:text-accent-300 text-sm mt-2 block">
              Manage →
            </Link>
          </Card>
        )}
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/fixtures/new">
            <Button className="w-full" variant="primary">
              Create New Fixture
            </Button>
          </Link>
          <Link href="/admin/teams/new">
            <Button className="w-full" variant="primary">
              Add New Team
            </Button>
          </Link>
          <Link href="/admin/players/new">
            <Button className="w-full" variant="primary">
              Add New Player
            </Button>
          </Link>
          <Link href="/admin/articles/new">
            <Button className="w-full" variant="primary">
              Add News Article
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

