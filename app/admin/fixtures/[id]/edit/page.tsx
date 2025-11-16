import { notFound } from 'next/navigation'
import { firestore } from '@/lib/firestore'
import { FixtureEditForm } from '@/components/admin/FixtureEditForm'

async function getFixture(id: string) {
  const fixture = await firestore.fixture.findUnique(id, {
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  })
  
  if (!fixture) return null
  
  // Get events separately
  const events = await firestore.matchEvent.findMany(
    { fixtureId: id },
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

async function getTeams() {
  return await firestore.team.findMany().then(teams => (teams as any[]).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
}

export default async function EditFixturePage({ params }: { params: { id: string } }) {
  const fixture = await getFixture(params.id)
  const teams = await getTeams()

  if (!fixture) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Edit Fixture</h1>
      <FixtureEditForm fixture={fixture} teams={teams} />
    </div>
  )
}

