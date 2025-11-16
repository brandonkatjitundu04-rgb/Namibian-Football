import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-card rounded-2xl shadow-lg border border-secondary-surface/50', className)}>
      {children}
    </div>
  )
}

