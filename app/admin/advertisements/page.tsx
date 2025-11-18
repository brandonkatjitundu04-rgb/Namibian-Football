'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'

interface Advertisement {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  position: string
  page?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  clickCount: number
  createdAt: string
}

export default function AdvertisementsPage() {
  const { user } = useUser()
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 'SIDEBAR',
    page: '',
    isActive: true,
    startDate: '',
    endDate: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check if user is super admin based on email or metadata
  const isSuperAdmin = user?.emailAddresses?.[0]?.emailAddress === 'brandonkatjitundu@gmail.com' || 
                       user?.publicMetadata?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAds()
    }
  }, [isSuperAdmin])

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/admin/advertisements')
      if (!res.ok) throw new Error('Failed to fetch ads')
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching ads:', error)
      setError('Failed to load advertisements')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editingAd
        ? `/api/admin/advertisements/${editingAd.id}`
        : '/api/admin/advertisements'
      const method = editingAd ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          page: formData.page || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save advertisement')
      }

      setShowForm(false)
      setEditingAd(null)
      setFormData({
        title: '',
        imageUrl: '',
        linkUrl: '',
        position: 'SIDEBAR',
        page: '',
        isActive: true,
        startDate: '',
        endDate: '',
      })
      fetchAds()
    } catch (error: any) {
      setError(error.message || 'Failed to save advertisement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return

    try {
      const res = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')
      fetchAds()
    } catch (error) {
      alert('Failed to delete advertisement')
    }
  }

  const startEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      position: ad.position,
      page: ad.page || '',
      isActive: ad.isActive,
      startDate: ad.startDate ? format(new Date(ad.startDate), 'yyyy-MM-dd') : '',
      endDate: ad.endDate ? format(new Date(ad.endDate), 'yyyy-MM-dd') : '',
    })
    setShowForm(true)
    setError('')
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Only super admin can manage advertisements.</p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading advertisements...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Advertisement Management</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add New Advertisement</Button>
        )}
      </div>

      {error && (
        <Card className="p-4 mb-6 bg-red-500/20 border-red-500/30">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {showForm && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Advertisement Image *
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                label="Upload Ad Image"
              />
            </div>

            <div>
              <label htmlFor="linkUrl" className="block text-sm font-medium mb-2">
                Link URL (optional)
              </label>
              <input
                id="linkUrl"
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="HEADER">Header</option>
                  <option value="SIDEBAR">Sidebar</option>
                  <option value="FOOTER">Footer</option>
                  <option value="INLINE">Inline</option>
                  <option value="POPUP">Popup</option>
                </select>
              </div>

              <div>
                <label htmlFor="page" className="block text-sm font-medium mb-2">
                  Specific Page (leave empty for all pages)
                </label>
                <input
                  id="page"
                  type="text"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value.trim() })}
                  className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
                  placeholder="/news or /teams (leave empty for all pages)"
                />
                <p className="text-xs text-muted mt-1">
                  Leave empty to show on all pages, or enter a specific path like /news or /teams
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date (optional)
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date (optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingAd ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingAd(null)
                  setFormData({
                    title: '',
                    imageUrl: '',
                    linkUrl: '',
                    position: 'SIDEBAR',
                    page: '',
                    isActive: true,
                    startDate: '',
                    endDate: '',
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Preview</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Title</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Position</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Page</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Status</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Clicks</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No advertisements yet
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr
                    key={ad.id}
                    className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="w-20 h-20 relative">
                        <Image
                          src={ad.imageUrl}
                          alt={ad.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium">{ad.title}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-xs px-2 py-1 rounded bg-accent-400/20 text-accent-400">
                        {ad.position}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-muted">
                      {ad.page || 'All Pages'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${ad.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">{ad.clickCount || 0}</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(ad)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-400 hover:text-red-300 border-red-500/30"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

