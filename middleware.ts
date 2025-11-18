import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define which routes should be protected (admin routes require authentication)
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes - require authentication
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    
    // Allow access to login/signup pages
    const isAuthPage = req.nextUrl.pathname === '/admin/login' || 
                       req.nextUrl.pathname === '/admin/sign-up' ||
                       req.nextUrl.pathname.startsWith('/admin/login') ||
                       req.nextUrl.pathname.startsWith('/admin/sign-up')
    
    if (!userId && !isAuthPage) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/admin/login', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Add pathname to headers for server components
  const response = NextResponse.next()
  response.headers.set('x-pathname', req.nextUrl.pathname)
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
