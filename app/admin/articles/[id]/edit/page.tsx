'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImageUrl: string
  videoUrl: string
  author: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState<Article | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/admin/articles/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch article')
        const data = await res.json()
        setFormData(data)
      } catch (error) {
        console.error('Error fetching article:', error)
        alert('Failed to load article')
        router.push('/admin/articles')
      } finally {
        setLoadingArticle(false)
      }
    }

    fetchArticle()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.status === 'PUBLISHED' && !formData.publishedAt 
            ? new Date().toISOString() 
            : formData.publishedAt,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update article')
      }

      router.push('/admin/articles')
      router.refresh()
    } catch (error) {
      console.error('Error updating article:', error)
      alert('Failed to update article. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      router.push('/admin/articles')
      router.refresh()
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loadingArticle) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading article...</p>
        </Card>
      </div>
    )
  }

  if (!formData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Edit Article</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              Slug (URL-friendly) *
            </label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              pattern="[a-z0-9\-]+"
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
            <p className="text-xs text-muted mt-1">
              Use lowercase letters, numbers, and hyphens only. Changing this will break existing links.
            </p>
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              Author *
            </label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt (Short Description)
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt || ''}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              placeholder="Brief summary of the article..."
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Featured Image
            </label>
            <ImageUpload
              value={formData.featuredImageUrl || ''}
              onChange={(url) => setFormData({ ...formData, featuredImageUrl: url })}
              label="Upload Featured Image"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Video
            </label>
            <ImageUpload
              value={formData.videoUrl || ''}
              onChange={(url) => setFormData({ ...formData, videoUrl: url })}
              label="Upload Video"
              accept="video/*"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              required
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t border-secondary-surface">
            <Button type="submit" disabled={loading || deleting}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading || deleting}
            >
              Cancel
            </Button>
            <div className="flex-1"></div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
            >
              {deleting ? 'Deleting...' : 'Delete Article'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

