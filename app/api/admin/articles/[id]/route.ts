import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

// GET single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const article = await firestore.article.findUnique(params.id)

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PUT update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, featuredImageUrl, videoUrl, author, status, publishedAt } = body

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (content !== undefined) updateData.content = content
    if (featuredImageUrl !== undefined) updateData.featuredImageUrl = featuredImageUrl
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (author !== undefined) updateData.author = author
    // Keep authorId linked to current user if updating
    const currentUser = await firestore.user.findById(session.user.id)
    if (currentUser) {
      updateData.authorId = session.user.id
      if (!author && (currentUser as any).name) {
        updateData.author = (currentUser as any).name
      }
    }
    if (status !== undefined) {
      updateData.status = status
      // Auto-set publishedAt when publishing
      if (status === 'PUBLISHED' && !publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null
    }

    const article = await firestore.article.update(params.id, updateData)

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await firestore.article.delete(params.id)

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}

