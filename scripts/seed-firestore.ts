// Load environment variables
import { config } from 'dotenv'
config()

import { db } from '../lib/firebase'
import { 
  collection, 
  doc, 
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  limit,
  Timestamp
} from 'firebase/firestore'
import * as bcrypt from 'bcryptjs'
import { dateToTimestamp } from '../lib/firestore-helpers'
import { recalculateAndSaveLeagueTable } from '../lib/table-calculator'

const COLLECTIONS = {
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  PLAYERS: 'players',
  FIXTURES: 'fixtures',
  TABLE_ROWS: 'tableRows',
  MATCH_EVENTS: 'matchEvents',
  SPONSORS: 'sponsors',
  USERS: 'users',
  STAFF: 'staff',
} as const

async function main() {
  console.log('🌱 Seeding Firestore database...')

  // Validate Firebase connection
  try {
    // Test Firestore connection
    const testQuery = query(collection(db, COLLECTIONS.USERS), limit(1))
    await getDocs(testQuery)
    console.log('✅ Firebase connection verified')
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message)
    console.error('Please check your Firebase configuration in .env file')
    throw new Error('Firebase connection failed. Please check your configuration.')
  }

  // Create or update admin user
  const adminEmail = 'branden.katjitundu04@gmail.com'
  const adminPassword = 'wozza2025!'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  // Check if admin user already exists
  const usersQuery = query(collection(db, COLLECTIONS.USERS), where('email', '==', adminEmail), limit(1))
  const existingUsers = await getDocs(usersQuery)
  
  let adminDocRef
  if (!existingUsers.empty) {
    // Update existing user
    adminDocRef = doc(db, COLLECTIONS.USERS, existingUsers.docs[0].id)
    await updateDoc(adminDocRef, {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      updatedAt: Timestamp.now(),
    })
    console.log('✅ Updated admin user')
  } else {
    // Create new admin user
    adminDocRef = doc(collection(db, COLLECTIONS.USERS))
    const adminData = {
      email: adminEmail,
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(adminDocRef, adminData)
    console.log('✅ Created admin user')
  }
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)

  // Create Premier League
  const leagueDocRef = doc(collection(db, COLLECTIONS.LEAGUES))
  const leagueData = {
    name: 'Namibian Premier League',
    season: '2024/2025',
    tier: 'PREMIER',
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  await setDoc(leagueDocRef, leagueData)
  const premierLeagueId = leagueDocRef.id
  console.log('✅ Created Premier League')

  // Create teams
  const teams = [
    {
      name: 'African Stars FC',
      shortName: 'African Stars',
      stadium: 'Sam Nujoma Stadium',
      founded: 1952,
    },
    {
      name: 'Black Africa FC',
      shortName: 'Black Africa',
      stadium: 'Independence Stadium',
      founded: 1963,
    },
    {
      name: 'Blue Waters FC',
      shortName: 'Blue Waters',
      stadium: 'Kuisebmond Stadium',
      founded: 1983,
    },
    {
      name: 'Tura Magic FC',
      shortName: 'Tura Magic',
      stadium: 'Sam Nujoma Stadium',
      founded: 2005,
    },
  ]

  const createdTeams: any[] = []
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'
  ]

  for (const teamData of teams) {
    const teamDocRef = doc(collection(db, COLLECTIONS.TEAMS))
    const teamDocData: any = {
      name: teamData.name,
      shortName: teamData.shortName,
      leagueId: premierLeagueId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    if (teamData.stadium) teamDocData.stadium = teamData.stadium
    if (teamData.founded) teamDocData.founded = teamData.founded
    await setDoc(teamDocRef, teamDocData)
    const team = { id: teamDocRef.id, ...teamData }
    createdTeams.push(team)
    console.log(`✅ Created team: ${team.name}`)

    // Create players for each team (22 players)
    const positions = ['GK', 'DF', 'MF', 'FW']
    const firstNames = [
      'John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Joseph',
      'Thomas', 'Charles', 'Daniel', 'Matthew', 'Mark', 'Donald', 'Anthony', 'Paul',
      'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian'
    ]

    for (let i = 0; i < 22; i++) {
      const position = positions[i % 4] as 'GK' | 'DF' | 'MF' | 'FW'
      const shirtNumber = i + 1
      const firstName = firstNames[i % firstNames.length]
      const lastName = lastNames[i % lastNames.length]
      const dob = new Date(1995 + (i % 10), i % 12, (i % 28) + 1)

      const playerDocRef = doc(collection(db, COLLECTIONS.PLAYERS))
      const dobTimestamp = dateToTimestamp(dob)
      await setDoc(playerDocRef, {
        teamId: teamDocRef.id,
        firstName,
        lastName,
        position,
        shirtNumber: shirtNumber || null,
        dob: dobTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }
    console.log(`✅ Created 22 players for ${team.name}`)

    // Create staff
    const managerDocRef = doc(collection(db, COLLECTIONS.STAFF))
    const managerData = {
      teamId: teamDocRef.id,
      firstName: 'Coach',
      lastName: lastNames[0],
      role: 'MANAGER',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(managerDocRef, managerData)

    const assistantDocRef = doc(collection(db, COLLECTIONS.STAFF))
    const assistantData = {
      teamId: teamDocRef.id,
      firstName: 'Assistant',
      lastName: lastNames[1],
      role: 'ASSISTANT_COACH',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(assistantDocRef, assistantData)
    console.log(`✅ Created staff for ${team.name}`)
  }

  // Create fixtures (6 fixtures)
  const fixtureDates = [
    new Date(2024, 0, 15, 15, 0), // Jan 15
    new Date(2024, 0, 22, 15, 0), // Jan 22
    new Date(2024, 1, 5, 15, 0),  // Feb 5
    new Date(2024, 1, 12, 15, 0), // Feb 12
    new Date(2024, 1, 19, 15, 0), // Feb 19
    new Date(2024, 1, 26, 15, 0), // Feb 26
  ]

  const fixtures = [
    { home: 0, away: 1, date: fixtureDates[0], homeScore: 2, awayScore: 1, status: 'FINISHED' },
    { home: 2, away: 3, date: fixtureDates[1], homeScore: 1, awayScore: 1, status: 'FINISHED' },
    { home: 1, away: 2, date: fixtureDates[2], homeScore: 3, awayScore: 0, status: 'FINISHED' },
    { home: 3, away: 0, date: fixtureDates[3], homeScore: 0, awayScore: 2, status: 'FINISHED' },
    { home: 0, away: 2, date: fixtureDates[4], homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { home: 1, away: 3, date: fixtureDates[5], homeScore: null, awayScore: null, status: 'SCHEDULED' },
  ]

  for (const fixtureData of fixtures) {
    const fixtureDocRef = doc(collection(db, COLLECTIONS.FIXTURES))
    const kickoffTimestamp = dateToTimestamp(fixtureData.date)
    const fixtureDocData: any = {
      leagueId: premierLeagueId,
      homeTeamId: createdTeams[fixtureData.home].id,
      awayTeamId: createdTeams[fixtureData.away].id,
      kickoff: kickoffTimestamp,
      venue: createdTeams[fixtureData.home].stadium || 'TBD',
      status: fixtureData.status,
      homeScore: fixtureData.homeScore !== null && fixtureData.homeScore !== undefined ? fixtureData.homeScore : 0,
      awayScore: fixtureData.awayScore !== null && fixtureData.awayScore !== undefined ? fixtureData.awayScore : 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(fixtureDocRef, fixtureDocData)

    // Add match events for finished fixtures
    if (fixtureData.status === 'FINISHED' && fixtureData.homeScore !== null) {
      // Get players for home and away teams
      const homePlayers: any[] = []
      const awayPlayers: any[] = []
      
      // We'll need to query players, but for simplicity, we'll create events with placeholder player IDs
      // In a real scenario, you'd query the players first
      const homeTeamPlayers = await getTeamPlayers(createdTeams[fixtureData.home].id)
      const awayTeamPlayers = await getTeamPlayers(createdTeams[fixtureData.away].id)

      // Add goals for home team
      for (let i = 0; i < fixtureData.homeScore; i++) {
        const eventDocRef = doc(collection(db, COLLECTIONS.MATCH_EVENTS))
        const eventData = {
          fixtureId: fixtureDocRef.id,
          playerId: homeTeamPlayers[i % homeTeamPlayers.length].id,
          type: 'GOAL',
          minute: 15 + i * 20,
          createdAt: Timestamp.now(),
        }
        await setDoc(eventDocRef, eventData)
      }
      
      // Add goals for away team
      for (let i = 0; i < fixtureData.awayScore; i++) {
        const eventDocRef = doc(collection(db, COLLECTIONS.MATCH_EVENTS))
        const eventData = {
          fixtureId: fixtureDocRef.id,
          playerId: awayTeamPlayers[i % awayTeamPlayers.length].id,
          type: 'GOAL',
          minute: 25 + i * 25,
          createdAt: Timestamp.now(),
        }
        await setDoc(eventDocRef, eventData)
      }
    }

    console.log(`✅ Created fixture: ${createdTeams[fixtureData.home].name} vs ${createdTeams[fixtureData.away].name}`)
  }

  // Create sponsors
  const sponsors = [
    {
      name: 'Namibia Breweries',
      tier: 'GOLD',
      website: 'https://www.nambrew.com',
    },
    {
      name: 'MTC Namibia',
      tier: 'GOLD',
      website: 'https://www.mtc.com.na',
    },
    {
      name: 'Bank Windhoek',
      tier: 'SILVER',
      website: 'https://www.bankwindhoek.com.na',
    },
    {
      name: 'FNB Namibia',
      tier: 'SILVER',
      website: 'https://www.fnbnamibia.com.na',
    },
    {
      name: 'Namibia Sport Commission',
      tier: 'BRONZE',
    },
  ]

  for (const sponsorData of sponsors) {
    const sponsorDocRef = doc(collection(db, COLLECTIONS.SPONSORS))
    const sponsorDocData: any = {
      name: sponsorData.name,
      tier: sponsorData.tier,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    if (sponsorData.website) sponsorDocData.website = sponsorData.website
    await setDoc(sponsorDocRef, sponsorDocData)
    console.log(`✅ Created sponsor: ${sponsorData.name}`)
  }

  // Recalculate league table
  console.log('📊 Recalculating league table...')
  await recalculateAndSaveLeagueTable(premierLeagueId)
  console.log('✅ Recalculated league table')

  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('You can now:')
  console.log('1. Visit http://localhost:3000 to see the home page')
  console.log('2. Login at http://localhost:3000/admin/login')
  console.log('   Email: admin@namibianfootball.com')
  console.log('   Password: admin123')
}

async function getTeamPlayers(teamId: string): Promise<any[]> {
  const { getDocs, query, where, collection } = await import('firebase/firestore')
  const q = query(collection(db, COLLECTIONS.PLAYERS), where('teamId', '==', teamId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(() => {
    console.log('')
    process.exit(0)
  })

