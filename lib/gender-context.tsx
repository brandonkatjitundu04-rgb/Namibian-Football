'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Gender = 'MALE' | 'FEMALE'

interface GenderContextType {
  gender: Gender
  setGender: (gender: Gender) => void
  toggleGender: () => void
}

const GenderContext = createContext<GenderContextType | undefined>(undefined)

export function GenderProvider({ children }: { children: ReactNode }) {
  const [gender, setGenderState] = useState<Gender>('MALE')
  const [mounted, setMounted] = useState(false)

  // Load gender from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('selectedGender') as Gender
    if (stored === 'MALE' || stored === 'FEMALE') {
      setGenderState(stored)
    }
  }, [])

  const setGender = (newGender: Gender) => {
    setGenderState(newGender)
    if (mounted) {
      localStorage.setItem('selectedGender', newGender)
    }
  }

  const toggleGender = () => {
    const newGender = gender === 'MALE' ? 'FEMALE' : 'MALE'
    setGender(newGender)
  }

  return (
    <GenderContext.Provider value={{ gender, setGender, toggleGender }}>
      {children}
    </GenderContext.Provider>
  )
}

export function useGender() {
  const context = useContext(GenderContext)
  if (context === undefined) {
    throw new Error('useGender must be used within a GenderProvider')
  }
  return context
}

