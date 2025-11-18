'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-card border border-secondary-surface',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted',
              socialButtonsBlockButton: 'bg-secondary-surface border-secondary-surface text-foreground hover:bg-secondary-surface/80',
              formButtonPrimary: 'bg-accent-400 hover:bg-accent-500 text-white',
              formFieldInput: 'bg-secondary-surface border-secondary-surface text-foreground',
              formFieldLabel: 'text-foreground',
              footerActionLink: 'text-accent-400 hover:text-accent-500',
            },
          }}
        />
      </div>
    </div>
  )
}

