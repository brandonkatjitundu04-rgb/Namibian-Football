import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { GenderProvider } from '@/lib/gender-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Namibian Premier Football League',
  description: 'Live league tables, fixtures, results, and statistics for the Namibian Premier Football League',
}

// Force dynamic rendering for all pages since Navbar uses Clerk
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // Always render ClerkProvider - it will handle missing keys gracefully in production
  // For local builds without keys, we'll provide an empty string which Clerk can handle
  return (
    <ClerkProvider publishableKey={publishableKey || 'pk_test_placeholder'}>
      <html lang="en" className="dark">
        <body className={inter.variable}>
          <GenderProvider>
            <div className="min-h-screen flex flex-col bg-bg">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </GenderProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

