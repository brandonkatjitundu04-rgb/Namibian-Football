'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface League {
  id: string
  name: string
  tier: string
}

export default function NewTeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingLeagues, setLoadingLeagues] = useState(false)
  const [leagues, setLeagues] = useState<League[]>([])
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    crestUrl: '',
    stadium: '',
    leagueId: '',
    gender: 'MALE',
    founded: '',
  })

  // Load leagues on mount
  useEffect(() => {
    let mounted = true
    
    const fetchLeagues = async () => {
      try {
        setLoadingLeagues(true)
        const res = await fetch('/api/leagues')
        const data = await res.json()
        
        if (!mounted) return
        
        if (Array.isArray(data)) {
          setLeagues(data)
        } else {
          console.error('Leagues data is not an array:', data)
          setLeagues([])
          alert('Failed to load leagues. Please check the console for details.')
        }
      } catch (err) {
        console.error('Error fetching leagues:', err)
        if (mounted) {
          setLeagues([])
          alert('Failed to load leagues. Please ensure Firebase is configured correctly.')
        }
      } finally {
        if (mounted) {
          setLoadingLeagues(false)
        }
      }
    }
    
    fetchLeagues()
    
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          founded: formData.founded ? parseInt(formData.founded) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      router.push('/admin/teams')
      router.refresh()
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Add New Team</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Team Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label htmlFor="shortName" className="block text-sm font-medium mb-2">
              Short Name *
            </label>
            <input
              id="shortName"
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Team Logo
            </label>
            <ImageUpload
              value={formData.crestUrl}
              onChange={(url) => setFormData({ ...formData, crestUrl: url })}
              label="Upload Logo"
            />
            <p className="text-xs text-muted mt-1">
              Upload a team logo image (PNG, JPG, or GIF). Max size: 5MB
            </p>
          </div>

          <div>
            <label htmlFor="stadium" className="block text-sm font-medium mb-2">
              Stadium
            </label>
            <input
              id="stadium"
              type="text"
              value={formData.stadium}
              onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
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
              <option value="MALE">Men's</option>
              <option value="FEMALE">Women's</option>
            </select>
          </div>

          <div>
            <label htmlFor="leagueId" className="block text-sm font-medium mb-2">
              League *
            </label>
            <select
              id="leagueId"
              value={formData.leagueId}
              onChange={(e) => setFormData({ ...formData, leagueId: e.target.value })}
              required
              disabled={loadingLeagues}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            >
              <option value="">
                {loadingLeagues ? 'Loading leagues...' : leagues.length === 0 ? 'No leagues available - create one first' : 'Select a league'}
              </option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name} ({league.tier})
                </option>
              ))}
            </select>
            {!loadingLeagues && leagues.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                Please create a league first before adding teams.{' '}
                <a href="/admin/leagues/new" className="underline">
                  Create League
                </a>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="founded" className="block text-sm font-medium mb-2">
              Founded Year
            </label>
            <input
              id="founded"
              type="number"
              value={formData.founded}
              onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
              min="1800"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
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

