'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Fixture, Team, MatchEvent, Player } from '@prisma/client'

interface FixtureEditFormProps {
  fixture: Fixture & {
    homeTeam: Team
    awayTeam: Team
    league: { id: string; name: string }
    events: (MatchEvent & {
      player: (Player & { team: Team }) | null
    })[]
  }
  teams: Team[]
}

export function FixtureEditForm({ fixture, teams }: FixtureEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    homeTeamId: fixture.homeTeamId,
    awayTeamId: fixture.awayTeamId,
    kickoff: new Date(fixture.kickoff).toISOString().slice(0, 16),
    venue: fixture.venue || '',
    status: fixture.status,
    homeScore: fixture.homeScore?.toString() || '',
    awayScore: fixture.awayScore?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/fixtures/${fixture.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          homeScore: formData.homeScore ? parseInt(formData.homeScore) : null,
          awayScore: formData.awayScore ? parseInt(formData.awayScore) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update fixture')
      }

      router.push('/admin/fixtures')
      router.refresh()
    } catch (error) {
      console.error('Error updating fixture:', error)
      alert('Failed to update fixture. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Home Team</label>
            <select
              value={formData.homeTeamId}
              onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
              required
            >
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
            required
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="FINISHED">Finished</option>
            <option value="POSTPONED">Postponed</option>
          </select>
        </div>

        {(formData.status === 'FINISHED' || formData.status === 'LIVE') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Home Score</label>
              <input
                type="number"
                min="0"
                value={formData.homeScore}
                onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Away Score</label>
              <input
                type="number"
                min="0"
                value={formData.awayScore}
                onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none"
                required
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
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

      {fixture.events.length > 0 && (
        <div className="mt-8 pt-8 border-t border-secondary-surface">
          <h3 className="text-xl font-bold mb-4">Match Events</h3>
          <div className="space-y-2">
            {fixture.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary-surface/30"
              >
                <div>
                  <span className="font-semibold">{event.minute}'</span>
                  <span className="ml-2">{event.type.replace('_', ' ')}</span>
                  {event.player && (
                    <span className="ml-2 text-muted">
                      - {event.player.firstName} {event.player.lastName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

