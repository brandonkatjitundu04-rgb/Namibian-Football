import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { firestore } from '@/lib/firestore'
import { recalculateAndSaveLeagueTable } from '@/lib/table-calculator'

// POST recalculate league table from fixtures
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await recalculateAndSaveLeagueTable(id)

    // Log audit
    await firestore.auditLog.create({
      userId: session.user.id,
      action: 'RECALCULATE',
      entityType: 'LeagueTable',
      entityId: id,
    })

    return NextResponse.json({ message: 'Table recalculated successfully' })
  } catch (error) {
    console.error('Error recalculating table:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate table' },
      { status: 500 }
    )
  }
}

