'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  name?: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UsersAdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'ADMIN',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create user')
      }

      setShowCreateForm(false)
      setFormData({ email: '', name: '', password: '', role: 'ADMIN' })
      fetchUsers()
    } catch (error: any) {
      setError(error.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password || undefined,
          role: formData.role,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user')
      }

      setEditingUser(null)
      setFormData({ email: '', name: '', password: '', role: 'ADMIN' })
      fetchUsers()
    } catch (error: any) {
      setError(error.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role,
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setFormData({ email: '', name: '', password: '', role: 'ADMIN' })
    setError('')
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      SUPER_ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      ADMIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      EDITOR: 'bg-green-500/20 text-green-400 border-green-500/30',
    }
    return styles[role as keyof typeof styles] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading users...</p>
        </Card>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Only super admin can manage users.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">User Management</h1>
        {!showCreateForm && !editingUser && (
          <Button onClick={() => setShowCreateForm(true)}>Add New User</Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingUser) && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={editingUser ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required={!editingUser}
                disabled={!!editingUser}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password {editingUser ? '(leave empty to keep current)' : '*'}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                disabled={editingUser?.role === 'SUPER_ADMIN'}
                className="w-full px-4 py-2 rounded-xl bg-secondary-surface border border-secondary-surface focus:border-accent-400 focus:outline-none text-foreground disabled:opacity-50"
              >
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
              </select>
              {editingUser?.role === 'SUPER_ADMIN' && (
                <p className="text-xs text-muted mt-1">Super admin role cannot be changed</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={editingUser ? cancelEdit : () => setShowCreateForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Email</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Name</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Role</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Created</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium">{user.email}</td>
                    <td className="py-3 px-2">{user.name || '-'}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-muted">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </Button>
                        {user.role !== 'SUPER_ADMIN' && user.id !== session?.user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.email)}
                            className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
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

