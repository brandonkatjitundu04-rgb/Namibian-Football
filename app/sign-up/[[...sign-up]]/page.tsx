'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted">Sign up to get started</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
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

