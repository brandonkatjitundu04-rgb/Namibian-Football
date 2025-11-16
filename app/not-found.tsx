import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <Card className="p-12">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-colors"
        >
          Return Home
        </Link>
      </Card>
    </div>
  )
}

