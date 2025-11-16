import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

async function getSponsors() {
  return await firestore.sponsor.findMany({
    orderBy: [
      { tier: 'asc' },
      { name: 'asc' },
    ],
  }) as any[]
}

export default async function SponsorsAdminPage() {
  const sponsors = await getSponsors()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Manage Sponsors</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/sponsors/new">
            <Button>Add New Sponsor</Button>
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
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Name</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Tier</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Website</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((sponsor) => (
                <tr
                  key={sponsor.id}
                  className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                >
                  <td className="py-3 px-2 font-medium">{sponsor.name}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sponsor.tier === 'GOLD'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : sponsor.tier === 'SILVER'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {sponsor.tier}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {sponsor.website ? (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-400 hover:text-accent-300"
                      >
                        {sponsor.website}
                      </a>
                    ) : (
                      '-'
                    )}
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

