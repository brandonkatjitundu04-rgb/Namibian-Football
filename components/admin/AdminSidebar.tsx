'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/leagues', label: 'Leagues', icon: '🏆' },
  { href: '/admin/teams', label: 'Teams', icon: '👥' },
  { href: '/admin/players', label: 'Players', icon: '⚽' },
  { href: '/admin/fixtures', label: 'Fixtures', icon: '📅' },
  { href: '/admin/articles', label: 'Articles', icon: '📰' },
  { href: '/admin/sponsors', label: 'Sponsors', icon: '💼' },
  { href: '/admin/advertisements', label: 'Advertisements', icon: '📢' },
  { href: '/admin/profile', label: 'My Profile', icon: '👤' },
]

const superAdminItems = [
  { href: '/admin/users', label: 'Users', icon: '🔐' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  return (
    <aside className="w-64 bg-card border-r border-secondary-surface min-h-screen p-6 fixed left-0 top-0 h-full overflow-y-auto">
      <div className="mb-8">
        <Link href="/admin" className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        </Link>
        {session?.user && (
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-secondary-surface">
            {session.user.image || session.user.profilePicture ? (
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src={session.user.image || session.user.profilePicture || ''}
                  alt={session.user.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-400 flex items-center justify-center">
                <span className="text-white font-bold">
                  {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name || 'Admin'}</p>
              <p className="text-xs text-muted truncate">{session.user.email}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-accent-400/20 text-accent-400 border border-accent-400/30'
                  : 'text-muted hover:text-foreground hover:bg-secondary-surface/50'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        {isSuperAdmin && (
          <>
            <div className="my-4 border-t border-secondary-surface"></div>
            {superAdminItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-accent-400/20 text-accent-400 border border-accent-400/30'
                      : 'text-muted hover:text-foreground hover:bg-secondary-surface/50'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}

