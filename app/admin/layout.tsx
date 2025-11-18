import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { currentUser } from '@clerk/nextjs/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Force dynamic rendering for admin pages (they require authentication)
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Allow access to login page without authentication
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login')
  const isSignUpPage = pathname === '/admin/sign-up' || pathname.startsWith('/admin/sign-up')
  
  // Try to get current user, but handle gracefully if Clerk isn't configured
  let user = null
  try {
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      user = await currentUser()
    }
  } catch (error) {
    // Clerk not configured or error getting user - allow build to continue
    console.warn('Clerk user check failed (this is OK during build if keys are not set):', error)
  }
  
  if (!isLoginPage && !isSignUpPage && !user) {
    redirect('/admin/login')
  }

  // Don't show sidebar on login/signup pages
  if (isLoginPage || isSignUpPage) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}
