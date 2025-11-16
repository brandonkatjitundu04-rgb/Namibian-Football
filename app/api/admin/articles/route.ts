import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'

// GET all articles (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const articles = await firestore.article.findMany(
      status ? { status } : undefined,
      { 
        orderBy: { createdAt: 'desc' },
      }
    )

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST create new article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, featuredImageUrl, videoUrl, author, status, publishedAt } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Get current user for author
    const currentUser = await firestore.user.findById(session.user.id)
    const authorName = author || currentUser?.name || session.user.name || session.user.email

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const article = await firestore.article.create({
      title,
      slug: finalSlug,
      excerpt: excerpt || null,
      content,
      featuredImageUrl: featuredImageUrl || null,
      videoUrl: videoUrl || null,
      author: authorName,
      authorId: session.user.id, // Link to current user
      status: status || 'DRAFT',
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

