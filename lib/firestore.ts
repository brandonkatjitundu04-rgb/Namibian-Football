import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  QueryConstraint,
  Query
} from 'firebase/firestore'
import { timestampToDate, dateToTimestamp } from './firestore-helpers'

// Collection names matching Prisma model names
const COLLECTIONS = {
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  PLAYERS: 'players',
  FIXTURES: 'fixtures',
  TABLE_ROWS: 'tableRows',
  MATCH_EVENTS: 'matchEvents',
  SPONSORS: 'sponsors',
  USERS: 'users',
  AUDIT_LOGS: 'auditLogs',
  STAFF: 'staff',
  ARTICLES: 'articles',
  ADVERTISEMENTS: 'advertisements',
} as const

// Helper to build queries
function buildQuery(collectionName: string, constraints: QueryConstraint[]): Query {
  const collectionRef = collection(db, collectionName)
  return constraints.length > 0 
    ? query(collectionRef, ...constraints)
    : query(collectionRef)
}

// League service
export const leagueService = {
  async findMany(filters?: { tier?: string; gender?: string }, options?: {
    include?: {
      tableRows?: {
        include?: { team?: boolean }
        orderBy?: { position: 'asc' | 'desc' }
      }
    }
    orderBy?: { tier: 'asc' | 'desc' }
  }) {
    const constraints: QueryConstraint[] = []
    if (filters?.tier) {
      constraints.push(where('tier', '==', filters.tier))
    }
    if (filters?.gender) {
      constraints.push(where('gender', '==', filters.gender))
    }
    
    // Note: Firestore requires an index for orderBy on different fields
    // For now, we'll sort in memory if needed
    const q = buildQuery(COLLECTIONS.LEAGUES, constraints)
    const snapshot = await getDocs(q)
    
    let leagues = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Sort in memory if orderBy is specified
    if (options?.orderBy) {
      leagues.sort((a, b) => {
        const tierOrder = { PREMIER: 1, DIVISION1: 2, DIVISION2: 3 }
        const aOrder = tierOrder[a.tier as keyof typeof tierOrder] || 999
        const bOrder = tierOrder[b.tier as keyof typeof tierOrder] || 999
        return options.orderBy!.tier === 'asc' ? aOrder - bOrder : bOrder - aOrder
      })
    }
    
    // Include relationships if needed
    if (options?.include) {
      leagues = await Promise.all(leagues.map(async (league) => {
        if (options.include?.tableRows) {
          league.tableRows = await tableRowService.findByLeague(league.id, {
            includeTeam: options.include.tableRows.include?.team,
            orderBy: options.include.tableRows.orderBy,
          })
        }
        return league
      }))
    }
    
    return leagues
  },

  async findFirst(filters: { tier?: string; gender?: string }, options?: {
    include?: {
      tableRows?: {
        include?: { team?: boolean }
        orderBy?: { position: 'asc' | 'desc' }
        take?: number
      }
      fixtures?: {
        include?: { homeTeam?: boolean; awayTeam?: boolean }
        orderBy?: { kickoff: 'asc' | 'desc' }
        take?: number
      }
    }
  }) {
    const constraints: QueryConstraint[] = []
    if (filters.tier) {
      constraints.push(where('tier', '==', filters.tier))
    }
    if (filters.gender) {
      constraints.push(where('gender', '==', filters.gender))
    }
    constraints.push(limit(1))
    
    const q = buildQuery(COLLECTIONS.LEAGUES, constraints)
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    const league: any = {
      id: doc.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
    
    if (options?.include) {
      if (options.include.tableRows) {
        league.tableRows = await tableRowService.findByLeague(doc.id, {
          includeTeam: options.include.tableRows.include?.team,
          orderBy: options.include.tableRows.orderBy,
          take: options.include.tableRows.take,
        })
      }
      if (options.include.fixtures) {
        league.fixtures = await fixtureService.findMany(
          { leagueId: doc.id },
          {
            include: options.include.fixtures.include,
            orderBy: options.include.fixtures.orderBy,
            take: options.include.fixtures.take,
          }
        )
      }
    }
    
    return league
  },

  async findUnique(id: string, options?: {
    include?: {
      tableRows?: {
        include?: { team?: boolean }
        orderBy?: { position: 'asc' | 'desc' }
      }
      fixtures?: {
        include?: { homeTeam?: boolean; awayTeam?: boolean }
        orderBy?: { kickoff: 'asc' | 'desc' }
        take?: number
      }
    }
  }) {
    const docRef = doc(db, COLLECTIONS.LEAGUES, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    const league: any = {
      id: docSnap.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
    
    if (options?.include) {
      if (options.include.tableRows) {
        league.tableRows = await tableRowService.findByLeague(docSnap.id, {
          includeTeam: options.include.tableRows.include?.team,
          orderBy: options.include.tableRows.orderBy,
        })
      }
      if (options.include.fixtures) {
        league.fixtures = await fixtureService.findMany(
          { leagueId: docSnap.id },
          {
            include: options.include.fixtures.include,
            orderBy: options.include.fixtures.orderBy,
            take: options.include.fixtures.take,
          }
        )
      }
    }
    
    return league
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.LEAGUES))
    const leagueData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, leagueData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.LEAGUES, id)
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    await updateDoc(docRef, updateData)
    return this.findUnique(id)
  },
}

// Team service
export const teamService = {
  async findUnique(id: string, options?: {
    include?: {
      league?: boolean
      players?: boolean
      staff?: boolean
      tableRow?: boolean
    }
  }) {
    const docRef = doc(db, COLLECTIONS.TEAMS, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    const team: any = {
      id: docSnap.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
    
    if (options?.include) {
      if (options.include.league && data.leagueId) {
        team.league = await leagueService.findUnique(data.leagueId)
      }
      if (options.include.players) {
        team.players = await playerService.findMany({ teamId: id })
      }
      if (options.include.staff) {
        team.staff = await staffService.findMany({ teamId: id })
      }
      if (options.include.tableRow) {
        const tableRows = await tableRowService.findByTeam(id)
        team.tableRow = tableRows.length > 0 ? tableRows[0] : null
      }
    }
    
    return team
  },

  async findMany(filters?: { leagueId?: string; gender?: string; ids?: string[] }) {
    const constraints: QueryConstraint[] = []
    if (filters?.leagueId) {
      constraints.push(where('leagueId', '==', filters.leagueId))
    }
    if (filters?.gender) {
      constraints.push(where('gender', '==', filters.gender))
    }
    
    const q = buildQuery(COLLECTIONS.TEAMS, constraints)
    const snapshot = await getDocs(q)
    
    let teams = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Filter by IDs if provided
    if (filters?.ids) {
      teams = teams.filter(t => filters.ids!.includes(t.id))
    }
    
    return teams
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.TEAMS))
    const teamData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, teamData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.TEAMS, id)
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    await updateDoc(docRef, updateData)
    return this.findUnique(id)
  },
}

// TableRow service
export const tableRowService = {
  async findByLeague(leagueId: string, options?: { includeTeam?: boolean; orderBy?: { position: 'asc' | 'desc' }; take?: number }) {
    const constraints: QueryConstraint[] = [
      where('leagueId', '==', leagueId)
    ]
    
    // Don't use Firestore orderBy to avoid index requirement - we'll sort in memory instead
    // if (options?.orderBy) {
    //   constraints.push(orderBy('position', options.orderBy.position))
    // }
    
    if (options?.take) {
      constraints.push(limit(options.take))
    }
    
    const q = buildQuery(COLLECTIONS.TABLE_ROWS, constraints)
    const snapshot = await getDocs(q)
    
    const rows = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data()
      const row: any = {
        id: doc.id,
        ...data,
        updatedAt: timestampToDate(data.updatedAt),
      }
      
      if (options?.includeTeam && data.teamId) {
        const team = await teamService.findUnique(data.teamId)
        row.team = team
      }
      
      return row
    }))
    
    // Filter out deleted rows (position 999) and sort by position
    const filteredRows = rows.filter(row => row.position !== 999 && row.position !== undefined)
    
    // Always sort in memory to avoid Firestore index requirement
    const sortOrder = options?.orderBy?.position || 'asc'
    filteredRows.sort((a, b) => {
      return sortOrder === 'asc' 
        ? (a.position || 999) - (b.position || 999)
        : (b.position || 999) - (a.position || 999)
    })
    
    // Apply take limit after sorting
    if (options?.take && filteredRows.length > options.take) {
      return filteredRows.slice(0, options.take)
    }
    
    return filteredRows
  },

  async findByTeam(teamId: string) {
    const constraints: QueryConstraint[] = [
      where('teamId', '==', teamId)
    ]
    
    const q = buildQuery(COLLECTIONS.TABLE_ROWS, constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
  },

  async upsert(teamId: string, data: any) {
    // Find existing table row by teamId AND leagueId (since a team can be in multiple leagues)
    const leagueId = data.leagueId
    if (!leagueId) {
      throw new Error('leagueId is required for table row upsert')
    }
    
    if (!teamId) {
      throw new Error('teamId is required for table row upsert')
    }
    
    try {
      // Query by leagueId only (to avoid composite index requirement), then filter by teamId in memory
      const constraints: QueryConstraint[] = [
        where('leagueId', '==', leagueId)
      ]
      const q = buildQuery(COLLECTIONS.TABLE_ROWS, constraints)
      const snapshot = await getDocs(q)
      
      // Find existing row by teamId in memory
      const existingDoc = snapshot.docs.find(doc => doc.data().teamId === teamId)
      const docId = existingDoc ? existingDoc.id : doc(collection(db, COLLECTIONS.TABLE_ROWS)).id
      
      const docRef = doc(db, COLLECTIONS.TABLE_ROWS, docId)
      const existingData = existingDoc ? existingDoc.data() : null
      
      const docData: any = {
        ...data,
        teamId,
        updatedAt: Timestamp.now(),
      }
      
      // Only set createdAt if it's a new document
      if (!existingData) {
        docData.createdAt = Timestamp.now()
      } else if (existingData.createdAt) {
        docData.createdAt = existingData.createdAt
      }
      
      await setDoc(docRef, docData, { merge: true })
      
      return { id: docId, ...docData }
    } catch (error: any) {
      console.error('Error in tableRow.upsert:', error)
      // If it's an index error, provide helpful message
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        throw new Error('Firestore index required. Please create a composite index for tableRows collection on (teamId, leagueId) fields.')
      }
      throw error
    }
  },
}

// Fixture service
export const fixtureService = {
  async findMany(filters?: { 
    status?: string
    leagueId?: string
    homeTeamId?: string
    awayTeamId?: string
    kickoff?: { gte?: Date }
  }, options?: {
    include?: {
      homeTeam?: boolean
      awayTeam?: boolean
      league?: boolean
    }
    orderBy?: { kickoff: 'asc' | 'desc' }
    take?: number
  }) {
    const constraints: QueryConstraint[] = []
    
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }
    
    if (filters?.leagueId) {
      constraints.push(where('leagueId', '==', filters.leagueId))
    }
    
    if (filters?.homeTeamId) {
      constraints.push(where('homeTeamId', '==', filters.homeTeamId))
    }
    
    if (filters?.awayTeamId) {
      constraints.push(where('awayTeamId', '==', filters.awayTeamId))
    }
    
    if (filters?.kickoff?.gte) {
      constraints.push(where('kickoff', '>=', dateToTimestamp(filters.kickoff.gte)))
    }
    
    // Firestore requires composite indexes when filtering and ordering on different fields
    // To avoid ALL index requirements, we'll ALWAYS do client-side sorting when we have:
    // - Any filter (status, leagueId, homeTeamId, awayTeamId) + orderBy
    // - OR kickoff filter + any other filter + orderBy
    // Only use Firestore orderBy when we have NO filters at all
    const hasNonKickoffFilter = !!(filters?.status || filters?.leagueId || filters?.homeTeamId || filters?.awayTeamId)
    const hasKickoffFilter = !!(filters?.kickoff?.gte)
    const hasAnyFilter = hasNonKickoffFilter || hasKickoffFilter
    const hasOrderBy = !!(options?.orderBy)
    
    // Only use Firestore orderBy if we have NO filters at all
    // Otherwise, always do client-side sorting to avoid index requirements
    const useFirestoreOrderBy = !hasAnyFilter && hasOrderBy
    
    if (useFirestoreOrderBy) {
      constraints.push(orderBy('kickoff', options.orderBy!.kickoff))
    }
    
    if (options?.take && useFirestoreOrderBy) {
      constraints.push(limit(options.take))
    }
    
    let fixtures: any[] = []
    
    try {
      const q = buildQuery(COLLECTIONS.FIXTURES, constraints)
      const snapshot = await getDocs(q)
      
      fixtures = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data()
      const fixture: any = {
        id: doc.id,
        ...data,
        kickoff: data.kickoff ? timestampToDate(data.kickoff) : null,
        createdAt: data.createdAt ? timestampToDate(data.createdAt) || new Date() : new Date(),
        updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) || new Date() : new Date(),
      }
      
      if (options?.include) {
        if (options.include.homeTeam && data.homeTeamId) {
          try {
            fixture.homeTeam = await teamService.findUnique(data.homeTeamId) || null
          } catch (e) {
            fixture.homeTeam = null
          }
        }
        if (options.include.awayTeam && data.awayTeamId) {
          try {
            fixture.awayTeam = await teamService.findUnique(data.awayTeamId) || null
          } catch (e) {
            fixture.awayTeam = null
          }
        }
        if (options.include.league && data.leagueId) {
          try {
            fixture.league = await leagueService.findUnique(data.leagueId) || null
          } catch (e) {
            fixture.league = null
          }
        }
      }
      
      return fixture
      }))
    } catch (error) {
      console.error('Error fetching fixtures:', error)
      return []
    }
    
    // Client-side sorting if needed (to avoid index requirements)
    // Do this whenever we have filters + orderBy (which is most cases)
    if (hasAnyFilter && hasOrderBy && options?.orderBy) {
      fixtures.sort((a, b) => {
        const aTime = a.kickoff?.getTime?.() || 0
        const bTime = b.kickoff?.getTime?.() || 0
        return options.orderBy!.kickoff === 'asc' ? aTime - bTime : bTime - aTime
      })
    }
    
    // Client-side limit if needed
    if (options?.take && hasAnyFilter && hasOrderBy) {
      fixtures = fixtures.slice(0, options.take)
    }
    
    return fixtures
  },

  async findUnique(id: string, options?: {
    include?: {
      homeTeam?: boolean
      awayTeam?: boolean
      league?: boolean
    }
  }) {
    const docRef = doc(db, COLLECTIONS.FIXTURES, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    const fixture: any = {
      id: docSnap.id,
      ...data,
      kickoff: timestampToDate(data.kickoff),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
    
    if (options?.include) {
      if (options.include.homeTeam && data.homeTeamId) {
        fixture.homeTeam = await teamService.findUnique(data.homeTeamId)
      }
      if (options.include.awayTeam && data.awayTeamId) {
        fixture.awayTeam = await teamService.findUnique(data.awayTeamId)
      }
      if (options.include.league && data.leagueId) {
        fixture.league = await leagueService.findUnique(data.leagueId)
      }
    }
    
    return fixture
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.FIXTURES))
    const fixtureData = {
      ...data,
      kickoff: dateToTimestamp(data.kickoff),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, fixtureData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.FIXTURES, id)
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    if (data.kickoff) {
      updateData.kickoff = dateToTimestamp(data.kickoff)
    }
    await updateDoc(docRef, updateData)
    
    // Return updated fixture
    return this.findUnique(id, { include: { league: true } })
  },
}

// Player service
export const playerService = {
  async findUnique(id: string, options?: {
    include?: {
      team?: { include?: { league?: boolean } }
      matchEvents?: {
        include?: { fixture?: { include?: { homeTeam?: boolean; awayTeam?: boolean } } }
        orderBy?: { fixture?: { kickoff: 'desc' } }
      }
    }
  }) {
    const docRef = doc(db, COLLECTIONS.PLAYERS, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    const player: any = {
      id: docSnap.id,
      ...data,
      dob: data.dob ? timestampToDate(data.dob) : null,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
    
    if (options?.include) {
      if (options.include.team && data.teamId) {
        player.team = await teamService.findUnique(data.teamId, {
          include: options.include.team.include
        })
      }
      if (options.include.matchEvents) {
        player.matchEvents = await matchEventService.findMany({ playerId: id }, {
          include: options.include.matchEvents.include,
          orderBy: options.include.matchEvents.orderBy,
        })
      }
    }
    
    return player
  },

  async findMany(filters?: { teamId?: string }) {
    const constraints: QueryConstraint[] = []
    if (filters?.teamId) {
      constraints.push(where('teamId', '==', filters.teamId))
    }
    
    const q = buildQuery(COLLECTIONS.PLAYERS, constraints)
    const snapshot = await getDocs(q)
    
    let players = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        dob: data.dob ? timestampToDate(data.dob) : null,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Sort by position, then shirt number
    players.sort((a, b) => {
      const positionOrder = { GK: 1, DF: 2, MF: 3, FW: 4 }
      const aPos = positionOrder[a.position as keyof typeof positionOrder] || 999
      const bPos = positionOrder[b.position as keyof typeof positionOrder] || 999
      if (aPos !== bPos) return aPos - bPos
      return (a.shirtNumber || 999) - (b.shirtNumber || 999)
    })
    
    return players
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.PLAYERS))
    const playerData = {
      ...data,
      dob: data.dob ? dateToTimestamp(data.dob) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, playerData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.PLAYERS, id)
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    if (data.dob) {
      updateData.dob = dateToTimestamp(data.dob)
    }
    await updateDoc(docRef, updateData)
    return this.findUnique(id)
  },
}

// Staff service
export const staffService = {
  async findMany(filters?: { teamId?: string }) {
    const constraints: QueryConstraint[] = []
    if (filters?.teamId) {
      constraints.push(where('teamId', '==', filters.teamId))
    }
    
    const q = buildQuery(COLLECTIONS.STAFF, constraints)
    const snapshot = await getDocs(q)
    
    let staff = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Sort by role
    const roleOrder = { MANAGER: 1, COACH: 2, ASSISTANT_COACH: 3, PHYSIO: 4, OTHER: 5 }
    staff.sort((a, b) => {
      const aRole = roleOrder[a.role as keyof typeof roleOrder] || 999
      const bRole = roleOrder[b.role as keyof typeof roleOrder] || 999
      return aRole - bRole
    })
    
    return staff
  },
}

// MatchEvent service
export const matchEventService = {
  async findMany(filters?: { playerId?: string; fixtureId?: string; type?: string }, options?: {
    include?: {
      fixture?: { include?: { homeTeam?: boolean; awayTeam?: boolean } }
      player?: { include?: { team?: boolean } }
    }
    orderBy?: { fixture?: { kickoff: 'desc' } }
  }) {
    const constraints: QueryConstraint[] = []
    if (filters?.playerId) {
      constraints.push(where('playerId', '==', filters.playerId))
    }
    if (filters?.fixtureId) {
      constraints.push(where('fixtureId', '==', filters.fixtureId))
    }
    if (filters?.type) {
      constraints.push(where('type', '==', filters.type))
    }
    
    const q = buildQuery(COLLECTIONS.MATCH_EVENTS, constraints)
    const snapshot = await getDocs(q)
    
    let events = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data()
      const event: any = {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
      }
      
      if (options?.include?.fixture && data.fixtureId) {
        event.fixture = await fixtureService.findUnique(data.fixtureId, {
          include: options.include.fixture.include,
        })
      }
      
      if (options?.include?.player && data.playerId) {
        event.player = await playerService.findUnique(data.playerId, {
          include: options.include.player.include,
        })
      }
      
      return event
    }))
    
    // Sort by fixture kickoff if needed
    if (options?.orderBy?.fixture) {
      events.sort((a, b) => {
        if (!a.fixture || !b.fixture) return 0
        const aTime = a.fixture.kickoff.getTime()
        const bTime = b.fixture.kickoff.getTime()
        return options.orderBy!.fixture!.kickoff === 'desc' ? bTime - aTime : aTime - bTime
      })
    }
    
    return events
  },
}

// Sponsor service
export const sponsorService = {
  async findMany(options?: {
    orderBy?: Array<{ tier?: 'asc' | 'desc'; name?: 'asc' | 'desc' }>
  }) {
    const q = buildQuery(COLLECTIONS.SPONSORS, [])
    const snapshot = await getDocs(q)
    
    let sponsors = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Sort if orderBy is specified
    if (options?.orderBy) {
      sponsors.sort((a, b) => {
        for (const order of options.orderBy!) {
          if (order.tier) {
            const tierOrder = { GOLD: 1, SILVER: 2, BRONZE: 3 }
            const aTier = tierOrder[a.tier as keyof typeof tierOrder] || 999
            const bTier = tierOrder[b.tier as keyof typeof tierOrder] || 999
            if (aTier !== bTier) {
              return order.tier === 'asc' ? aTier - bTier : bTier - aTier
            }
          }
          if (order.name) {
            const nameCompare = a.name.localeCompare(b.name)
            if (nameCompare !== 0) {
              return order.name === 'asc' ? nameCompare : -nameCompare
            }
          }
        }
        return 0
      })
    }
    
    return sponsors
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.SPONSORS))
    const sponsorData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, sponsorData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.SPONSORS, id)
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    await updateDoc(docRef, updateData)
    return { id, ...data }
  },
}

// AuditLog service
export const auditLogService = {
  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.AUDIT_LOGS))
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, ...data }
  },
}

// User service (for authentication and management)
export const userService = {
  async findUnique(email: string) {
    const constraints: QueryConstraint[] = [
      where('email', '==', email),
      limit(1)
    ]
    
    const q = buildQuery(COLLECTIONS.USERS, constraints)
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  },

  async findById(id: string) {
    const docRef = doc(db, COLLECTIONS.USERS, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  },

  async findMany() {
    const q = buildQuery(COLLECTIONS.USERS, [])
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.USERS))
    const userData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, userData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.USERS, id)
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    await updateDoc(docRef, updateData)
    return this.findById(id)
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTIONS.USERS, id)
    await deleteDoc(docRef)
    return { id }
  },
}

// Article service
export const articleService = {
  async findMany(filters?: { status?: string }, options?: {
    orderBy?: { publishedAt?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' }
    take?: number
  }) {
    const constraints: QueryConstraint[] = []
    
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }
    
    // For orderBy with filters, we need to do client-side sorting
    const hasFilter = !!filters?.status
    const hasOrderBy = !!options?.orderBy
    
    if (!hasFilter && hasOrderBy) {
      if (options.orderBy.publishedAt) {
        constraints.push(orderBy('publishedAt', options.orderBy.publishedAt))
      } else if (options.orderBy.createdAt) {
        constraints.push(orderBy('createdAt', options.orderBy.createdAt))
      }
      
      if (options?.take) {
        constraints.push(limit(options.take))
      }
    }
    
    const q = buildQuery(COLLECTIONS.ARTICLES, constraints)
    const snapshot = await getDocs(q)
    
    let articles = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : null,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Client-side sorting if we have filters
    if (hasFilter && hasOrderBy && options?.orderBy) {
      articles.sort((a, b) => {
        if (options.orderBy!.publishedAt) {
          const aTime = a.publishedAt?.getTime?.() || 0
          const bTime = b.publishedAt?.getTime?.() || 0
          return options.orderBy!.publishedAt === 'desc' ? bTime - aTime : aTime - bTime
        } else if (options.orderBy!.createdAt) {
          const aTime = a.createdAt?.getTime?.() || 0
          const bTime = b.createdAt?.getTime?.() || 0
          return options.orderBy!.createdAt === 'desc' ? bTime - aTime : aTime - bTime
        }
        return 0
      })
    }
    
    // Client-side limit if needed
    if (hasFilter && options?.take) {
      articles = articles.slice(0, options.take)
    }
    
    return articles
  },

  async findUnique(id: string) {
    const docRef = doc(db, COLLECTIONS.ARTICLES, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : null,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  },

  async findBySlug(slug: string) {
    const constraints: QueryConstraint[] = [
      where('slug', '==', slug),
      limit(1)
    ]
    
    const q = buildQuery(COLLECTIONS.ARTICLES, constraints)
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : null,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.ARTICLES))
    const articleData = {
      ...data,
      publishedAt: data.publishedAt ? dateToTimestamp(data.publishedAt) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, articleData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.ARTICLES, id)
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt ? dateToTimestamp(data.publishedAt) : null
    }
    await updateDoc(docRef, updateData)
    return this.findUnique(id)
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTIONS.ARTICLES, id)
    await deleteDoc(docRef)
    return { id }
  },
}

// Advertisement service
export const advertisementService = {
  async findMany(filters?: { isActive?: boolean; position?: string; page?: string }) {
    const constraints: QueryConstraint[] = []
    
    // Only filter by isActive and position at Firestore level
    // Page filtering will be done client-side to allow for "all pages" ads
    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive))
    }
    if (filters?.position) {
      constraints.push(where('position', '==', filters.position))
    }
    
    const q = buildQuery(COLLECTIONS.ADVERTISEMENTS, constraints)
    const snapshot = await getDocs(q)
    
    let ads = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate ? timestampToDate(data.startDate) : null,
        endDate: data.endDate ? timestampToDate(data.endDate) : null,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      }
    })
    
    // Filter by date range
    const now = new Date()
    ads = ads.filter(ad => {
      // If startDate exists and is in the future, exclude
      if (ad.startDate) {
        const start = new Date(ad.startDate)
        // Set time to start of day for comparison
        start.setHours(0, 0, 0, 0)
        const nowStart = new Date(now)
        nowStart.setHours(0, 0, 0, 0)
        if (start > nowStart) {
          console.log(`Ad ${ad.id} excluded: startDate ${start} is in the future (now: ${nowStart})`)
          return false
        }
      }
      // If endDate exists and is in the past, exclude
      if (ad.endDate) {
        const end = new Date(ad.endDate)
        // Set time to end of day for comparison
        end.setHours(23, 59, 59, 999)
        if (end < now) {
          console.log(`Ad ${ad.id} excluded: endDate ${end} is in the past (now: ${now})`)
          return false
        }
      }
      return true
    })
    
    // Don't filter by page here - return all ads for the position
    // The component will handle page-specific vs general ads
    
    console.log(`After filtering: ${ads.length} ads remaining for position ${filters?.position}`)
    if (ads.length > 0) {
      console.log('Sample ad:', {
        id: ads[0].id,
        title: ads[0].title,
        position: ads[0].position,
        page: ads[0].page,
        isActive: ads[0].isActive,
        startDate: ads[0].startDate,
        endDate: ads[0].endDate,
        imageUrl: ads[0].imageUrl ? 'present' : 'missing',
      })
    }
    
    return ads
  },

  async findUnique(id: string) {
    const docRef = doc(db, COLLECTIONS.ADVERTISEMENTS, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      startDate: data.startDate ? timestampToDate(data.startDate) : null,
      endDate: data.endDate ? timestampToDate(data.endDate) : null,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  },

  async create(data: any) {
    const docRef = doc(collection(db, COLLECTIONS.ADVERTISEMENTS))
    const adData = {
      ...data,
      startDate: data.startDate ? dateToTimestamp(data.startDate) : null,
      endDate: data.endDate ? dateToTimestamp(data.endDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(docRef, adData)
    return { id: docRef.id, ...data }
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTIONS.ADVERTISEMENTS, id)
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? dateToTimestamp(data.startDate) : null
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? dateToTimestamp(data.endDate) : null
    }
    await updateDoc(docRef, updateData)
    return this.findUnique(id)
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTIONS.ADVERTISEMENTS, id)
    await deleteDoc(docRef)
    return { id }
  },

  async incrementClick(id: string) {
    const docRef = doc(db, COLLECTIONS.ADVERTISEMENTS, id)
    const ad = await this.findUnique(id)
    if (ad) {
      await updateDoc(docRef, {
        clickCount: (ad.clickCount || 0) + 1,
        updatedAt: Timestamp.now(),
      })
    }
  },
}

// Export a Prisma-like interface for easier migration
export const firestore = {
  league: leagueService,
  team: teamService,
  fixture: fixtureService,
  tableRow: tableRowService,
  player: playerService,
  staff: staffService,
  matchEvent: matchEventService,
  sponsor: sponsorService,
  auditLog: auditLogService,
  user: userService,
  article: articleService,
  advertisement: advertisementService,
}

