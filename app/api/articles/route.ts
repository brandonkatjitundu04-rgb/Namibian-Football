import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

// GET published articles (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const status = searchParams.get('status') || 'PUBLISHED'

    const articles = await firestore.article.findMany(
      { status },
      { 
        orderBy: { publishedAt: 'desc' },
        take: limit,
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

