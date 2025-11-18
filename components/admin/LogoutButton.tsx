'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
    >
      Logout
    </Button>
  )
}

