import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

// GET active advertisements for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') || undefined
    const page = searchParams.get('page') || undefined

    console.log('Fetching ads with filters:', { position, page })

    const filters: any = { isActive: true }
    if (position) filters.position = position
    // Pass page for client-side filtering (to handle "all pages" ads)
    if (page) filters.page = page

    const ads = await firestore.advertisement.findMany(filters)
    
    console.log(`Found ${Array.isArray(ads) ? ads.length : 0} active ads`, ads)
    
    // Return ads array (even if empty)
    return NextResponse.json(Array.isArray(ads) ? ads : [])
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advertisements', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

