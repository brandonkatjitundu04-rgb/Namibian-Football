import { Card } from '@/components/ui/Card'

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
        <h2 className="text-2xl font-bold mb-4">League History</h2>
        <p className="text-muted leading-relaxed mb-4">
          The Namibian Premier Football League has a rich history spanning several decades.
          Established to provide a structured competitive environment for football clubs across
          Namibia, the league has grown to become the premier football competition in the country.
        </p>
        <p className="text-muted leading-relaxed">
          Over the years, the league has produced numerous talented players who have gone on to
          represent Namibia on the international stage, contributing to the growth and development
          of football both domestically and internationally.
        </p>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <div className="space-y-4 text-muted">
          <p>
            For general inquiries, please email us at:{' '}
            <a href="mailto:info@namibianfootball.com" className="text-accent-400 hover:text-accent-300">
              info@namibianfootball.com
            </a>
          </p>
          <p>
            For media inquiries, please contact:{' '}
            <a href="mailto:media@namibianfootball.com" className="text-accent-400 hover:text-accent-300">
              media@namibianfootball.com
            </a>
          </p>
          <p>
            For sponsorship opportunities, please reach out to:{' '}
            <a href="mailto:sponsors@namibianfootball.com" className="text-accent-400 hover:text-accent-300">
              sponsors@namibianfootball.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}

