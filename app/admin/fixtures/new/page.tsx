import { firestore } from '@/lib/firestore'
import { NewFixtureForm } from '@/components/admin/NewFixtureForm'

async function getData() {
  const [leagues, teams] = await Promise.all([
    firestore.league.findMany().then(leagues => leagues.sort((a, b) => a.name.localeCompare(b.name))),
    firestore.team.findMany().then(teams => teams.sort((a, b) => a.name.localeCompare(b.name))),
  ])

  return { leagues, teams }
}

export default async function NewFixturePage() {
  const { leagues, teams } = await getData()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Create New Fixture</h1>
      <NewFixtureForm leagues={leagues} teams={teams} />
    </div>
  )
}

