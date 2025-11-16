'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import Image from 'next/image'

interface Team {
  id: string
  name: string
  shortName: string
  crestUrl?: string
}

interface TableRow {
  id: string
  teamId: string
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  team?: Team
}

interface League {
  id: string
  name: string
  season: string
}

export default function LeagueTablePage() {
  const router = useRouter()
  const params = useParams()
  const leagueId = params.id as string

  const [league, setLeague] = useState<League | null>(null)
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [formData, setFormData] = useState({
    position: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  })

  useEffect(() => {
    fetchData()
  }, [leagueId])

  const fetchData = async () => {
    try {
      const [leagueRes, tableRes, teamsRes] = await Promise.all([
        fetch(`/api/admin/leagues/${leagueId}`),
        fetch(`/api/admin/leagues/${leagueId}/table`),
        fetch(`/api/teams?leagueId=${leagueId}`),
      ])

      const leagueData = await leagueRes.json()
      const tableData = await tableRes.json()
      const teamsData = await teamsRes.json()

      setLeague(leagueData)
      setTableRows(Array.isArray(tableData) ? tableData : [])
      setTeams(Array.isArray(teamsData) ? teamsData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    if (!confirm('Recalculate table from fixtures? This will overwrite manual changes.')) {
      return
    }

    setRecalculating(true)
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/table/recalculate`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to recalculate')
      fetchData()
      alert('Table recalculated successfully!')
    } catch (error) {
      console.error('Error recalculating:', error)
      alert('Failed to recalculate table')
    } finally {
      setRecalculating(false)
    }
  }

  const startEdit = (row: TableRow) => {
    setEditingRow(row.id)
    setFormData({
      position: row.position,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      points: row.points,
    })
  }

  const cancelEdit = () => {
    setEditingRow(null)
    setFormData({
      position: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    })
  }

  const handleSave = async (rowId: string) => {
    setSaving(true)
    try {
      const goalDifference = formData.goalsFor - formData.goalsAgainst

      const res = await fetch(`/api/admin/leagues/${leagueId}/table/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goalDifference,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      await fetchData()
      cancelEdit()
      alert('Table row updated successfully!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRow = async () => {
    if (!selectedTeamId) {
      alert('Please select a team')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeamId,
          position: tableRows.length + 1,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('API Error:', data)
        throw new Error(data.error || data.details || 'Failed to add row')
      }
      
      // Refresh the table data
      await fetchData()
      setShowAddTeam(false)
      setSelectedTeamId('')
      alert('Team added to table successfully!')
    } catch (error: any) {
      console.error('Error adding row:', error)
      const errorMessage = error?.message || 'Failed to add team to table'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (rowId: string) => {
    if (!confirm('Remove this team from the table?')) return

    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/table/${rowId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to remove team')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading table...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/leagues" className="text-accent-400 hover:text-accent-300 mb-2 inline-block">
            ← Back to Leagues
          </Link>
          <h1 className="text-4xl font-bold">{league?.name} - Table Management</h1>
          <p className="text-muted">{league?.season}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleRecalculate} disabled={recalculating} variant="outline">
            {recalculating ? 'Recalculating...' : 'Recalculate from Fixtures'}
          </Button>
          <Button onClick={() => setShowAddTeam(true)} disabled={saving}>
            Add Team
          </Button>
        </div>
      </div>

      {showAddTeam && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Add Team to Table</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="teamSelect" className="block text-sm font-medium mb-2">
                Select Team *
              </label>
              <select
                id="teamSelect"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              >
                <option value="">Select a team...</option>
                {teams
                  .filter(team => !tableRows.some(row => row.teamId === team.id))
                  .map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
              {teams.filter(team => !tableRows.some(row => row.teamId === team.id)).length === 0 && (
                <p className="text-sm text-muted mt-2">All teams are already in the table</p>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleAddRow} disabled={saving || !selectedTeamId}>
                {saving ? 'Adding...' : 'Add Team'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddTeam(false)
                setSelectedTeamId('')
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Pos</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Team</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">P</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">W</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">D</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">L</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">GF</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">GA</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">GD</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Pts</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted">
                    No teams in table yet. Add teams or recalculate from fixtures.
                  </td>
                </tr>
              ) : (
                tableRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                  >
                    {editingRow === row.id ? (
                      <>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2 font-medium">{row.team?.name || 'Unknown'}</td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.played}
                            onChange={(e) => setFormData({ ...formData, played: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.won}
                            onChange={(e) => setFormData({ ...formData, won: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.drawn}
                            onChange={(e) => setFormData({ ...formData, drawn: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.lost}
                            onChange={(e) => setFormData({ ...formData, lost: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.goalsFor}
                            onChange={(e) => setFormData({ ...formData, goalsFor: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.goalsAgainst}
                            onChange={(e) => setFormData({ ...formData, goalsAgainst: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          {formData.goalsFor - formData.goalsAgainst > 0 ? '+' : ''}
                          {formData.goalsFor - formData.goalsAgainst}
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-secondary-surface border border-secondary-surface text-foreground"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSave(row.id)} disabled={saving}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-2 font-semibold">
                          <div className="flex items-center gap-2">
                            {row.position}
                            {row.position <= 2 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                                CAF CL
                              </span>
                            )}
                            {row.position > tableRows.length - 3 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                                R
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3 px-2 font-medium ${
                          row.position <= 2 ? 'bg-blue-500/5' : 
                          row.position > tableRows.length - 3 ? 'bg-red-500/5' : ''
                        }`}>
                          {row.team?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-2 text-center">{row.played}</td>
                        <td className="py-3 px-2 text-center">{row.won}</td>
                        <td className="py-3 px-2 text-center">{row.drawn}</td>
                        <td className="py-3 px-2 text-center">{row.lost}</td>
                        <td className="py-3 px-2 text-center">{row.goalsFor}</td>
                        <td className="py-3 px-2 text-center">{row.goalsAgainst}</td>
                        <td className="py-3 px-2 text-center">
                          {row.goalDifference > 0 ? '+' : ''}
                          {row.goalDifference}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold">{row.points}</td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(row.id)}
                              className="text-red-400 hover:text-red-300 border-red-500/30"
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

