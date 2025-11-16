'use client'

import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <Card className="p-12">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted mb-8">
          An error occurred while processing your request. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

