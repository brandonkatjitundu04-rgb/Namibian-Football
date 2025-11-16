import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-secondary-surface bg-card mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Namibian Football</h3>
            <p className="text-muted text-sm">
              Your source for live league tables, fixtures, results, and statistics.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/fixtures" className="text-muted hover:text-foreground transition-colors">
                  Fixtures
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-muted hover:text-foreground transition-colors">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="text-muted hover:text-foreground transition-colors">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-muted hover:text-foreground transition-colors">
                  Admin Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="text-muted text-sm">
              For inquiries, please contact us through our{' '}
              <Link href="/about" className="text-accent-400 hover:text-accent-300">
                about page
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-secondary-surface text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} Namibian Premier Football League. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

