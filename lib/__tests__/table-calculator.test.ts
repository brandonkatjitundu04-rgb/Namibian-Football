import { calculateLeagueTable } from '../table-calculator'
import { prisma } from '../prisma'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    league: {
      findUnique: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
    },
    fixture: {
      findMany: jest.fn(),
    },
  },
}))

describe('calculateLeagueTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should calculate table correctly with wins, draws, and losses', async () => {
    const mockLeague = {
      id: 'league1',
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
    }

    const mockTeams = [
      { id: 'team1', name: 'Team A' },
      { id: 'team2', name: 'Team B' },
    ]

    const mockFixtures = [
      {
        id: 'fixture1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        homeScore: 2,
        awayScore: 1,
        status: 'FINISHED',
      },
      {
        id: 'fixture2',
        homeTeamId: 'team2',
        awayTeamId: 'team1',
        homeScore: 1,
        awayScore: 1,
        status: 'FINISHED',
      },
    ]

    ;(prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague)
    ;(prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams)
    ;(prisma.fixture.findMany as jest.Mock).mockResolvedValue(mockFixtures)

    const result = await calculateLeagueTable('league1')

    expect(result).toHaveLength(2)
    
    // Team 1: 1 win, 1 draw = 4 points, 3 GF, 2 GA, GD +1
    const team1 = result.find((r) => r.teamId === 'team1')
    expect(team1?.points).toBe(4)
    expect(team1?.won).toBe(1)
    expect(team1?.drawn).toBe(1)
    expect(team1?.lost).toBe(0)
    expect(team1?.goalsFor).toBe(3)
    expect(team1?.goalsAgainst).toBe(2)
    expect(team1?.goalDifference).toBe(1)

    // Team 2: 0 wins, 1 draw, 1 loss = 1 point, 2 GF, 3 GA, GD -1
    const team2 = result.find((r) => r.teamId === 'team2')
    expect(team2?.points).toBe(1)
    expect(team2?.won).toBe(0)
    expect(team2?.drawn).toBe(1)
    expect(team2?.lost).toBe(1)
    expect(team2?.goalsFor).toBe(2)
    expect(team2?.goalsAgainst).toBe(3)
    expect(team2?.goalDifference).toBe(-1)
  })

  it('should sort by points, then goal difference, then goals for', async () => {
    const mockLeague = {
      id: 'league1',
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
    }

    const mockTeams = [
      { id: 'team1', name: 'Team A' },
      { id: 'team2', name: 'Team B' },
      { id: 'team3', name: 'Team C' },
    ]

    const mockFixtures = [
      // Team 1: 1 win = 3 points, GD +1, GF 2
      {
        id: 'fixture1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        homeScore: 2,
        awayScore: 1,
        status: 'FINISHED',
      },
      // Team 2: 1 win = 3 points, GD +1, GF 3 (should rank higher)
      {
        id: 'fixture2',
        homeTeamId: 'team2',
        awayTeamId: 'team3',
        homeScore: 3,
        awayScore: 2,
        status: 'FINISHED',
      },
      // Team 3: 0 points
      {
        id: 'fixture3',
        homeTeamId: 'team3',
        awayTeamId: 'team1',
        homeScore: 0,
        awayScore: 1,
        status: 'FINISHED',
      },
    ]

    ;(prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague)
    ;(prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams)
    ;(prisma.fixture.findMany as jest.Mock).mockResolvedValue(mockFixtures)

    const result = await calculateLeagueTable('league1')

    expect(result[0].teamId).toBe('team2') // 3 points, GD +1, GF 3
    expect(result[1].teamId).toBe('team1') // 3 points, GD +1, GF 2
    expect(result[2].teamId).toBe('team3') // 0 points
  })

  it('should handle equal goal difference correctly', async () => {
    const mockLeague = {
      id: 'league1',
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
    }

    const mockTeams = [
      { id: 'team1', name: 'Team A' },
      { id: 'team2', name: 'Team B' },
    ]

    const mockFixtures = [
      {
        id: 'fixture1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        homeScore: 3,
        awayScore: 1,
        status: 'FINISHED',
      },
      {
        id: 'fixture2',
        homeTeamId: 'team2',
        awayTeamId: 'team1',
        homeScore: 2,
        awayScore: 0,
        status: 'FINISHED',
      },
    ]

    ;(prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague)
    ;(prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams)
    ;(prisma.fixture.findMany as jest.Mock).mockResolvedValue(mockFixtures)

    const result = await calculateLeagueTable('league1')

    // Both teams have 3 points and GD +2, but team1 has more goals for (3 vs 2)
    expect(result[0].teamId).toBe('team1')
    expect(result[1].teamId).toBe('team2')
  })
})

