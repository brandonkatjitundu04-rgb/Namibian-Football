import { PrismaClient, PlayerPosition } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@namibianfootball.com' },
    update: {},
    create: {
      email: 'admin@namibianfootball.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user')

  // Create Premier League
  const premierLeague = await prisma.league.create({
    data: {
      name: 'Namibian Premier League',
      season: '2024/2025',
      tier: 'PREMIER',
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
    },
  })
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

  const createdTeams = []
  for (const teamData of teams) {
    const team = await prisma.team.create({
      data: {
        ...teamData,
        leagueId: premierLeague.id,
      },
    })
    createdTeams.push(team)
    console.log(`✅ Created team: ${team.name}`)

    // Create players for each team (22 players)
    const firstNames = [
      'John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Joseph',
      'Thomas', 'Charles', 'Daniel', 'Matthew', 'Mark', 'Donald', 'Anthony', 'Paul',
      'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian'
    ]
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
      'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'
    ]

    for (let i = 0; i < 22; i++) {
      // Define positions using the correct PlayerPosition enum
      const positions: PlayerPosition[] = [PlayerPosition.GK, PlayerPosition.DF, PlayerPosition.MF, PlayerPosition.FW]
      const position = positions[i % 4]
      const shirtNumber = i < 11 ? i + 1 : i + 1
      const firstName = firstNames[i % firstNames.length]
      const lastName = lastNames[i % lastNames.length]
      const dob = new Date(1995 + (i % 10), i % 12, (i % 28) + 1)

      await prisma.player.create({
        data: {
          teamId: team.id,
          firstName,
          lastName,
          position,
          shirtNumber,
          dob,
        },
      })
    }
    console.log(`✅ Created 22 players for ${team.name}`)

    // Create staff
    await prisma.staff.createMany({
      data: [
        {
          teamId: team.id,
          firstName: 'Coach',
          lastName: lastNames[0],
          role: 'MANAGER',
        },
        {
          teamId: team.id,
          firstName: 'Assistant',
          lastName: lastNames[1],
          role: 'ASSISTANT_COACH',
        },
      ],
    })
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
    const fixture = await prisma.fixture.create({
      data: {
        leagueId: premierLeague.id,
        homeTeamId: createdTeams[fixtureData.home].id,
        awayTeamId: createdTeams[fixtureData.away].id,
        kickoff: fixtureData.date,
        venue: createdTeams[fixtureData.home].stadium || 'TBD',
        status: fixtureData.status as any,
        homeScore: fixtureData.homeScore ?? 0,
        awayScore: fixtureData.awayScore ?? 0,
      },
    })

    // Add match events for finished fixtures
    if (fixtureData.status === 'FINISHED' && fixtureData.homeScore !== null) {
      const homePlayers = await prisma.player.findMany({
        where: { teamId: createdTeams[fixtureData.home].id },
        take: 3,
      })
      const awayPlayers = await prisma.player.findMany({
        where: { teamId: createdTeams[fixtureData.away].id },
        take: 3,
      })

      // Add goals
      for (let i = 0; i < fixtureData.homeScore; i++) {
        await prisma.matchEvent.create({
          data: {
            fixtureId: fixture.id,
            playerId: homePlayers[i % homePlayers.length].id,
            type: 'GOAL',
            minute: 15 + i * 20,
          },
        })
      }
      for (let i = 0; i < fixtureData.awayScore; i++) {
        await prisma.matchEvent.create({
          data: {
            fixtureId: fixture.id,
            playerId: awayPlayers[i % awayPlayers.length].id,
            type: 'GOAL',
            minute: 25 + i * 25,
          },
        })
      }
    }

    console.log(`✅ Created fixture: ${createdTeams[fixtureData.home].name} vs ${createdTeams[fixtureData.away].name}`)
  }

  // Create sponsors
  const sponsors = [
    {
      name: 'Namibia Breweries',
      tier: 'GOLD' as const,
      website: 'https://www.nambrew.com',
    },
    {
      name: 'MTC Namibia',
      tier: 'GOLD' as const,
      website: 'https://www.mtc.com.na',
    },
    {
      name: 'Bank Windhoek',
      tier: 'SILVER' as const,
      website: 'https://www.bankwindhoek.com.na',
    },
    {
      name: 'FNB Namibia',
      tier: 'SILVER' as const,
      website: 'https://www.fnbnamibia.com.na',
    },
    {
      name: 'Namibia Sport Commission',
      tier: 'BRONZE' as const,
    },
  ]

  for (const sponsorData of sponsors) {
    await prisma.sponsor.create({
      data: sponsorData,
    })
    console.log(`✅ Created sponsor: ${sponsorData.name}`)
  }

  // Recalculate league table
  await recalculateLeagueTable(premierLeague.id)

  console.log('🎉 Seeding completed!')
}

async function recalculateLeagueTable(leagueId: string) {
  // Get all teams in the league
  const teams = await prisma.team.findMany({
    where: { leagueId },
  })

  // Get all finished fixtures
  const finishedFixtures = await prisma.fixture.findMany({
    where: {
      leagueId,
      status: 'FINISHED',
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })

  // Initialize table rows
  const tableData = new Map<string, {
    teamId: string
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
  }>()

  for (const team of teams) {
    tableData.set(team.id, {
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  }

  // Process fixtures
  for (const fixture of finishedFixtures) {
    if (fixture.homeScore === null || fixture.awayScore === null) continue

    const homeData = tableData.get(fixture.homeTeamId)!
    const awayData = tableData.get(fixture.awayTeamId)!

    homeData.played++
    awayData.played++
    homeData.goalsFor += fixture.homeScore
    homeData.goalsAgainst += fixture.awayScore
    awayData.goalsFor += fixture.awayScore
    awayData.goalsAgainst += fixture.homeScore

    if (fixture.homeScore > fixture.awayScore) {
      homeData.won++
      awayData.lost++
      homeData.points += 3
    } else if (fixture.homeScore < fixture.awayScore) {
      homeData.lost++
      awayData.won++
      awayData.points += 3
    } else {
      homeData.drawn++
      awayData.drawn++
      homeData.points += 1
      awayData.points += 1
    }
  }

  // Calculate goal differences
  for (const data of tableData.values()) {
    data.goalDifference = data.goalsFor - data.goalsAgainst
  }

  // Sort by points, then goal difference, then goals for
  const sorted = Array.from(tableData.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Update or create table rows
  for (let i = 0; i < sorted.length; i++) {
    const data = sorted[i]
    await prisma.tableRow.upsert({
      where: { teamId: data.teamId },
      update: {
        position: i + 1,
        played: data.played,
        won: data.won,
        drawn: data.drawn,
        lost: data.lost,
        goalsFor: data.goalsFor,
        goalsAgainst: data.goalsAgainst,
        goalDifference: data.goalDifference,
        points: data.points,
      },
      create: {
        leagueId,
        teamId: data.teamId,
        position: i + 1,
        played: data.played,
        won: data.won,
        drawn: data.drawn,
        lost: data.lost,
        goalsFor: data.goalsFor,
        goalsAgainst: data.goalsAgainst,
        goalDifference: data.goalDifference,
        points: data.points,
      },
    })
  }

  console.log('✅ Recalculated league table')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
