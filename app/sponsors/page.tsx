import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import Image from 'next/image'

async function getSponsors() {
  const sponsors = await firestore.sponsor.findMany({
    orderBy: [
      { tier: 'asc' },
      { name: 'asc' },
    ],
  }) as any[]

  return sponsors
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors()

  const tierLabels: Record<string, string> = {
    GOLD: 'Gold Sponsor',
    SILVER: 'Silver Sponsor',
    BRONZE: 'Bronze Sponsor',
  }

  const tierColors: Record<string, string> = {
    GOLD: 'bg-gold-500/20 text-gold-500 border-gold-500/30',
    SILVER: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    BRONZE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  const groupedSponsors = sponsors.reduce((acc, sponsor: any) => {
    if (!acc[sponsor.tier]) {
      acc[sponsor.tier] = []
    }
    acc[sponsor.tier].push(sponsor)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Our Sponsors</h1>
      <p className="text-muted text-lg mb-12">
        We are grateful to our sponsors for their continued support of Namibian football.
      </p>

      {(['GOLD', 'SILVER', 'BRONZE'] as const).map((tier) => {
        const tierSponsors = groupedSponsors[tier] || []
        if (tierSponsors.length === 0) return null

        return (
          <div key={tier} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{tierLabels[tier]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tierSponsors.map((sponsor: any) => (
                <Card key={sponsor.id} className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {sponsor.logoUrl && (
                      <div className="w-32 h-32 relative mb-4">
                        <Image
                          src={sponsor.logoUrl}
                          alt={sponsor.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{sponsor.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${tierColors[tier]}`}
                    >
                      {tierLabels[tier]}
                    </span>
                    {sponsor.website && (
                      <Link
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-accent-400 hover:text-accent-300 transition-colors text-sm"
                      >
                        Visit Website →
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

