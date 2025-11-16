'use client'

import { useGender } from '@/lib/gender-context'
import { cn } from '@/lib/utils'

export function GenderToggle() {
  const { gender, setGender } = useGender()

  return (
    <div className="flex items-center gap-1 bg-secondary-surface rounded-full p-1">
      <button
        onClick={() => setGender('MALE')}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
          gender === 'MALE'
            ? 'bg-accent-400 text-background'
            : 'text-muted hover:text-foreground'
        )}
      >
        Men&apos;s
      </button>
      <button
        onClick={() => setGender('FEMALE')}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
          gender === 'FEMALE'
            ? 'bg-accent-400 text-background'
            : 'text-muted hover:text-foreground'
        )}
      >
        Women&apos;s
      </button>
    </div>
  )
}

