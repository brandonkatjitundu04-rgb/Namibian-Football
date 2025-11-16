'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function NewArticlePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImageUrl: '',
    videoUrl: '',
    author: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  })

  // Auto-fill author from session
  useEffect(() => {
    if (session?.user && !formData.author) {
      setFormData(prev => ({
        ...prev,
        author: session.user.name || session.user.email || '',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.status === 'PUBLISHED' ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create article')
      }

      router.push('/admin/articles')
      router.refresh()
    } catch (error) {
      console.error('Error creating article:', error)
      alert('Failed to create article. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({ 
      ...formData, 
      title,
      slug: formData.slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Add New Article</h1>
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
              onChange={(e) => handleTitleChange(e.target.value)}
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
              Auto-generated from title. Use lowercase letters, numbers, and hyphens only.
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
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              placeholder="Brief summary of the article..."
            />
            <p className="text-xs text-muted mt-1">
              This will be shown in article listings. Leave empty to auto-generate from content.
            </p>
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
              placeholder="Write your article content here. You can use markdown formatting..."
            />
            <p className="text-xs text-muted mt-1">
              Full article content. Supports basic formatting.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Featured Image
            </label>
            <ImageUpload
              value={formData.featuredImageUrl}
              onChange={(url) => setFormData({ ...formData, featuredImageUrl: url })}
              label="Upload Featured Image"
            />
            <p className="text-xs text-muted mt-1">
              Upload a featured image for the article (PNG, JPG, or GIF). Max size: 5MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Video
            </label>
            <ImageUpload
              value={formData.videoUrl}
              onChange={(url) => setFormData({ ...formData, videoUrl: url })}
              label="Upload Video"
              accept="video/*"
            />
            <p className="text-xs text-muted mt-1">
              Upload a video for the article (MP4, WebM). Max size: 5MB
            </p>
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
            <p className="text-xs text-muted mt-1">
              {formData.status === 'PUBLISHED' && 'Article will be visible to public immediately.'}
              {formData.status === 'DRAFT' && 'Article will be saved as draft and not visible to public.'}
              {formData.status === 'ARCHIVED' && 'Article will be archived and not visible to public.'}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Article'}
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

