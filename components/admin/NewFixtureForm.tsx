'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { League, Team } from '@prisma/client'

interface NewFixtureFormProps {
  leagues: League[]
  teams: Team[]
}

export function NewFixtureForm({ leagues, teams }: NewFixtureFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leagueId: '',
    homeTeamId: '',
    awayTeamId: '',
    kickoff: '',
    venue: '',
    status: 'SCHEDULED',
    streamingUrl: '',
    ticketUrl: '',
    referee: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create fixture')
      }

      router.push('/admin/fixtures')
      router.refresh()
    } catch (error) {
      console.error('Error creating fixture:', error)
      alert('Failed to create fixture. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">League</label>
          <select
            value={formData.leagueId}
            onChange={(e) => setFormData({ ...formData, leagueId: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
            required
          >
            <option value="">Select a league</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name} - {league.season}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Home Team</label>
            <select
              value={formData.homeTeamId}
              onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              required
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Away Team</label>
            <select
              value={formData.awayTeamId}
              onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              required
            >
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kickoff Date & Time</label>
            <input
              type="datetime-local"
              value={formData.kickoff}
              onChange={(e) => setFormData({ ...formData, kickoff: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
            required
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="POSTPONED">Postponed</option>
          </select>
        </div>

        <div className="border-t border-secondary-surface pt-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information (Optional)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Streaming URL
                <span className="text-muted text-xs ml-2">(Where fans can watch online)</span>
              </label>
              <input
                type="url"
                value={formData.streamingUrl}
                onChange={(e) => setFormData({ ...formData, streamingUrl: e.target.value })}
                placeholder="https://example.com/watch"
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ticket URL
                <span className="text-muted text-xs ml-2">(Where to purchase tickets)</span>
              </label>
              <input
                type="url"
                value={formData.ticketUrl}
                onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                placeholder="https://example.com/tickets"
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Referee</label>
              <input
                type="text"
                value={formData.referee}
                onChange={(e) => setFormData({ ...formData, referee: e.target.value })}
                placeholder="Referee name"
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes
                <span className="text-muted text-xs ml-2">(Additional information)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information about this fixture..."
                rows={3}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Fixture'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/fixtures')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

