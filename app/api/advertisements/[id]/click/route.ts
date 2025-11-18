import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firestore'

// POST increment click count for an advertisement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await firestore.advertisement.incrementClick(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing click count:', error)
    return NextResponse.json(
      { error: 'Failed to increment click count' },
      { status: 500 }
    )
  }
}
