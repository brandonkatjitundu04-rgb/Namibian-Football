'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { GenderToggle } from './GenderToggle'

function AuthSection() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-sm font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary-surface/50">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="text-sm font-medium bg-accent-400 hover:bg-accent-500 text-white px-4 py-1.5 rounded-md transition-colors">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Profile
          </Link>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
          <Link
            href="/admin"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        </div>
      </SignedIn>
    </>
  )
}

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/tables', label: 'Tables' },
    { href: '/fixtures', label: 'Fixtures' },
    { href: '/teams', label: 'Teams' },
    { href: '/players', label: 'Players' },
    { href: '/stats', label: 'Stats' },
    { href: '/news', label: 'News' },
    { href: '/sponsors', label: 'Sponsors' },
    { href: '/contact', label: 'Contact' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="border-b border-secondary-surface bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-foreground hover:text-accent-400 transition-colors">
            Namibian Football
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-accent-400'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <GenderToggle />
            <AuthSection />
          </div>
        </div>
      </div>
    </nav>
  )
}

