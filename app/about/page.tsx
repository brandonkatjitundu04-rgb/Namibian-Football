import { Card } from '@/components/ui/Card'

// Force dynamic rendering since Navbar uses Clerk
export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About the League</h1>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted leading-relaxed mb-4">
          The Namibian Premier Football League is dedicated to promoting and developing football
          in Namibia. We strive to provide a platform for talented players to showcase their skills,
          foster healthy competition, and bring communities together through the beautiful game.
        </p>
        <p className="text-muted leading-relaxed">
          Our commitment extends beyond the pitch—we aim to inspire the next generation of
          footballers and create lasting positive impacts in our communities.
        </p>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">League Structure</h2>
        <p className="text-muted leading-relaxed mb-4">
          The Namibian Premier Football League consists of multiple tiers, including the Premier
          Division, Division 1, and Division 2. Each tier features competitive football with
          promotion and relegation systems to maintain high standards and provide opportunities
          for teams to progress.
        </p>
        <p className="text-muted leading-relaxed">
          Our league system ensures fair competition, proper governance, and the development
          of football talent across all levels.
        </p>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p className="text-muted leading-relaxed mb-4">
          For inquiries, partnerships, or general information about the league, please visit our
          contact page or reach out through our official channels.
        </p>
        <p className="text-muted leading-relaxed">
          We welcome feedback, suggestions, and opportunities to collaborate with stakeholders
          who share our passion for developing football in Namibia.
        </p>
      </Card>
    </div>
  )
}
