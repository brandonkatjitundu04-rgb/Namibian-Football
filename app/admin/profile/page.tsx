'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface UserProfile {
  id: string
  email: string
  name?: string
  profilePicture?: string
  bio?: string
  role: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePicture: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/users/me')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/admin/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const updated = await res.json()
      setProfile(updated)
      setSuccess('Profile updated successfully!')
      
      // Update session
      await update()
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading profile...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl ml-0">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      {error && (
        <Card className="p-4 mb-6 bg-red-500/20 border-red-500/30">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="p-4 mb-6 bg-green-500/20 border-green-500/30">
          <p className="text-green-400">{success}</p>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-secondary-surface">
            {formData.profilePicture ? (
              <div className="w-24 h-24 relative rounded-full overflow-hidden">
                <img
                  src={formData.profilePicture}
                  alt={profile?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary-surface flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {(profile?.name || profile?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{profile?.name || profile?.email}</h2>
              <p className="text-muted">{profile?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-accent-400/20 text-accent-400 border border-accent-400/30">
                {profile?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Picture
            </label>
            <ImageUpload
              value={formData.profilePicture}
              onChange={(url) => setFormData({ ...formData, profilePicture: url })}
              label="Upload Profile Picture"
            />
            <p className="text-xs text-muted mt-1">
              Upload a profile picture (PNG, JPG, or GIF). Max size: 5MB
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-muted mt-1">
              Your bio will appear on articles you write
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

