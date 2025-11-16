'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Team {
  id: string
  name: string
  shortName: string
}

export default function NewPlayerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    photoUrl: '',
    position: 'GK',
    squadStatus: 'FIRST_TEAM',
    shirtNumber: '',
    teamId: '',
    dob: '',
  })

  // Load teams on mount
  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTeams(data)
        } else {
          console.error('Teams data is not an array:', data)
          setTeams([])
        }
      })
      .catch(err => {
        console.error('Error fetching teams:', err)
        setTeams([])
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shirtNumber: formData.shirtNumber ? parseInt(formData.shirtNumber) : null,
          dob: formData.dob || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create player')
      }

      router.push('/admin/players')
      router.refresh()
    } catch (error) {
      console.error('Error creating player:', error)
      alert('Failed to create player. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Add New Player</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Player Photo
            </label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              label="Upload Photo"
            />
            <p className="text-xs text-muted mt-1">
              Upload a player photo (PNG, JPG, or GIF). Max size: 5MB
            </p>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium mb-2">
              Position *
            </label>
            <select
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            >
              <optgroup label="Goalkeeper">
                <option value="GK">Goalkeeper (GK)</option>
              </optgroup>
              <optgroup label="Defenders">
                <option value="CB">Center Back (CB)</option>
                <option value="LB">Left Back (LB)</option>
                <option value="RB">Right Back (RB)</option>
              </optgroup>
              <optgroup label="Midfielders">
                <option value="CDM">Defensive Midfielder (CDM)</option>
                <option value="CM">Center Midfielder (CM)</option>
                <option value="LM">Left Midfielder (LM)</option>
                <option value="RM">Right Midfielder (RM)</option>
                <option value="CAM">Attacking Midfielder (CAM)</option>
              </optgroup>
              <optgroup label="Forwards">
                <option value="LW">Left Winger (LW)</option>
                <option value="RW">Right Winger (RW)</option>
                <option value="CF">Center Forward (CF)</option>
                <option value="ST">Striker (ST)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="squadStatus" className="block text-sm font-medium mb-2">
              Squad Status *
            </label>
            <select
              id="squadStatus"
              value={formData.squadStatus}
              onChange={(e) => setFormData({ ...formData, squadStatus: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            >
              <option value="FIRST_TEAM">First Team</option>
              <option value="RESERVE">Reserve Squad</option>
            </select>
          </div>

          <div>
            <label htmlFor="shirtNumber" className="block text-sm font-medium mb-2">
              Shirt Number
            </label>
            <input
              id="shirtNumber"
              type="number"
              value={formData.shirtNumber}
              onChange={(e) => setFormData({ ...formData, shirtNumber: e.target.value })}
              min="1"
              max="99"
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label htmlFor="teamId" className="block text-sm font-medium mb-2">
              Team *
            </label>
            <select
              id="teamId"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Player'}
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

