import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { GenderProvider } from '@/lib/gender-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Namibian Premier Football League',
  description: 'Live league tables, fixtures, results, and statistics for the Namibian Premier Football League',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.variable}>
        <SessionProvider>
          <GenderProvider>
            <div className="min-h-screen flex flex-col bg-bg">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </GenderProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

