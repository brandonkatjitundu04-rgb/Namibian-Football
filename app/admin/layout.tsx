import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { SessionProvider } from '@/components/providers/SessionProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Allow access to login page without authentication
  // The middleware already handles auth, but we double-check here for safety
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login')
  
  if (!isLoginPage && !session) {
    redirect('/admin/login')
  }

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <SessionProvider>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}

