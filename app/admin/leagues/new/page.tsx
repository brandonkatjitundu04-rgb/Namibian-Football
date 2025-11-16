'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function NewLeaguePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    logoUrl: '',
    tier: 'PREMIER',
    gender: 'MALE',
    winPoints: '3',
    drawPoints: '1',
    lossPoints: '0',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          winPoints: parseInt(formData.winPoints),
          drawPoints: parseInt(formData.drawPoints),
          lossPoints: parseInt(formData.lossPoints),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create league')
      }

      router.push('/admin/leagues')
      router.refresh()
    } catch (error) {
      console.error('Error creating league:', error)
      alert('Failed to create league. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Add New League</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              League Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Namibian Premier League"
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              League Logo
            </label>
            <ImageUpload
              value={formData.logoUrl}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
              label="Upload Logo"
            />
            <p className="text-xs text-muted mt-1">
              Upload a league logo image (PNG, JPG, or GIF). Max size: 5MB
            </p>
          </div>

          <div>
            <label htmlFor="season" className="block text-sm font-medium mb-2">
              Season *
            </label>
            <input
              id="season"
              type="text"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              required
              placeholder="e.g., 2024/25"
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tier" className="block text-sm font-medium mb-2">
                Tier *
              </label>
              <select
                id="tier"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              >
                <option value="PREMIER">Premier League</option>
                <option value="DIVISION1">Division 1</option>
                <option value="DIVISION2">Division 2</option>
              </select>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              >
                <option value="MALE">Men&apos;s</option>
                <option value="FEMALE">Women&apos;s</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="winPoints" className="block text-sm font-medium mb-2">
                Points for Win *
              </label>
              <input
                id="winPoints"
                type="number"
                value={formData.winPoints}
                onChange={(e) => setFormData({ ...formData, winPoints: e.target.value })}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="drawPoints" className="block text-sm font-medium mb-2">
                Points for Draw *
              </label>
              <input
                id="drawPoints"
                type="number"
                value={formData.drawPoints}
                onChange={(e) => setFormData({ ...formData, drawPoints: e.target.value })}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="lossPoints" className="block text-sm font-medium mb-2">
                Points for Loss *
              </label>
              <input
                id="lossPoints"
                type="number"
                value={formData.lossPoints}
                onChange={(e) => setFormData({ ...formData, lossPoints: e.target.value })}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              />
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted mb-4">
              * Required fields
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create League'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

