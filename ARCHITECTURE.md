# Live Score Integration Architecture

This document describes how to integrate a real-time live score feed into the Namibian Football League application.

## Current Architecture

The application is built with:
- **Next.js 14** (App Router) for server-side rendering and API routes
- **PostgreSQL** with Prisma ORM for data persistence
- **NextAuth.js** for authentication
- **Server Actions** for server-side mutations

## Integration Points

### 1. Webhook Endpoint

Create a webhook endpoint to receive score updates from an external service:

**File**: `app/api/webhooks/live-scores/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalculateAndSaveLeagueTable } from '@/lib/table-calculator'

export async function POST(request: NextRequest) {
  // Verify webhook signature (important for security)
  const signature = request.headers.get('x-webhook-signature')
  if (!verifySignature(signature, await request.text())) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = await request.json()
  const { fixtureId, homeScore, awayScore, events, status } = data

  // Update fixture
  const fixture = await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      homeScore,
      awayScore,
      status,
    },
  })

  // Add match events (goals, cards, etc.)
  if (events) {
    await prisma.matchEvent.createMany({
      data: events.map((event: any) => ({
        fixtureId,
        playerId: event.playerId,
        type: event.type,
        minute: event.minute,
        meta: event.meta,
      })),
    })
  }

  // Recalculate table if finished
  if (status === 'FINISHED') {
    await recalculateAndSaveLeagueTable(fixture.leagueId)
  }

  return NextResponse.json({ success: true })
}
```

### 2. WebSocket Server (Optional)

For real-time updates without polling, add a WebSocket server:

**Option A: Using Socket.io**

1. Install dependencies:
```bash
npm install socket.io socket.io-client
```

2. Create WebSocket server in `server.js`:
```javascript
const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    console.log('Client connected')

    socket.on('subscribe-fixture', (fixtureId) => {
      socket.join(`fixture-${fixtureId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  // Broadcast updates when fixture changes
  // This would be called from your webhook handler
  global.io = io

  httpServer.listen(3000, () => {
    console.log('Server ready on http://localhost:3000')
  })
})
```

3. In webhook handler, broadcast updates:
```typescript
if (global.io) {
  global.io.to(`fixture-${fixtureId}`).emit('score-update', {
    fixtureId,
    homeScore,
    awayScore,
    events,
  })
}
```

**Option B: Using Server-Sent Events (SSE)**

Create an SSE endpoint for simpler real-time updates:

```typescript
// app/api/fixtures/[id]/stream/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const encoder = new TextEncoder()
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ fixtureId: params.id })}\n\n`)
      )

      // Set up polling or event listener
      const interval = setInterval(async () => {
        const fixture = await prisma.fixture.findUnique({
          where: { id: params.id },
        })
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(fixture)}\n\n`)
        )
      }, 5000) // Poll every 5 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

### 3. Client-Side Integration

**Using React Query with polling:**

```typescript
// components/FixtureLiveScore.tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export function FixtureLiveScore({ fixtureId }: { fixtureId: string }) {
  const { data } = useQuery({
    queryKey: ['fixture', fixtureId],
    queryFn: async () => {
      const res = await fetch(`/api/fixtures/${fixtureId}`)
      return res.json()
    },
    refetchInterval: 5000, // Poll every 5 seconds
  })

  if (!data) return <div>Loading...</div>

  return (
    <div>
      <div className="text-2xl font-bold">
        {data.homeScore} - {data.awayScore}
      </div>
      {data.status === 'LIVE' && (
        <span className="text-red-400 animate-pulse">LIVE</span>
      )}
    </div>
  )
}
```

**Using WebSocket client:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function FixtureLiveScore({ fixtureId }: { fixtureId: string }) {
  const [score, setScore] = useState({ homeScore: 0, awayScore: 0 })

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000')

    socket.emit('subscribe-fixture', fixtureId)

    socket.on('score-update', (data) => {
      setScore({ homeScore: data.homeScore, awayScore: data.awayScore })
    })

    return () => {
      socket.disconnect()
    }
  }, [fixtureId])

  return (
    <div className="text-2xl font-bold">
      {score.homeScore} - {score.awayScore}
    </div>
  )
}
```

### 4. Match Simulation (Testing)

The admin panel includes a match simulation feature for testing:

**File**: `app/api/admin/fixtures/[id]/simulate/route.ts`

```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Simulate a match by creating events with delays
  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: { homeTeam: { include: { players: true } }, awayTeam: { include: { players: true } } },
  })

  // Update status to LIVE
  await prisma.fixture.update({
    where: { id: params.id },
    data: { status: 'LIVE', homeScore: 0, awayScore: 0 },
  })

  // Simulate goals at random intervals
  // This is a simplified example
  const simulateGoal = async (teamId: string, isHome: boolean) => {
    const team = isHome ? fixture.homeTeam : fixture.awayTeam
    const player = team.players[Math.floor(Math.random() * team.players.length)]
    const minute = Math.floor(Math.random() * 90) + 1

    await prisma.matchEvent.create({
      data: {
        fixtureId: params.id,
        playerId: player.id,
        type: 'GOAL',
        minute,
      },
    })

    // Update score
    if (isHome) {
      await prisma.fixture.update({
        where: { id: params.id },
        data: { homeScore: { increment: 1 } },
      })
    } else {
      await prisma.fixture.update({
        where: { id: params.id },
        data: { awayScore: { increment: 1 } },
      })
    }
  }

  // Run simulation (simplified - in production, use a job queue)
  // ...

  return NextResponse.json({ success: true })
}
```

## Security Considerations

1. **Webhook Authentication**: Always verify webhook signatures
2. **Rate Limiting**: Implement rate limiting on webhook endpoints
3. **Input Validation**: Validate all incoming data
4. **CORS**: Configure CORS properly for WebSocket connections

## Deployment

### Environment Variables

Add to your `.env`:
```
WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

### Infrastructure

For production:
- Use a message queue (Redis, RabbitMQ) for handling score updates
- Use a job queue (Bull, BullMQ) for match simulation
- Consider using a service like Pusher or Ably for WebSocket management
- Use a CDN for static assets

## Testing

1. Use the match simulation feature in the admin panel
2. Test webhook endpoints with tools like Postman or ngrok
3. Monitor WebSocket connections in development
4. Load test with multiple concurrent connections

## Future Enhancements

- Push notifications for score updates
- Real-time commentary feed
- Live match statistics
- Video highlights integration
- Social media integration

