"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/use-user'

export function useOnboarding() {
  const { isLoggedIn, loading: userLoading } = useUser()
  const [completed, setCompleted] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && isLoggedIn) {
      checkOnboardingStatus()
    } else if (!userLoading && !isLoggedIn) {
      setLoading(false)
      setCompleted(null)
    }
  }, [isLoggedIn, userLoading])

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/users/onboarding')
      const data = await res.json()
      setCompleted(data.onboarding_completed)
    } catch (error) {
      console.error('Check onboarding error:', error)
      setCompleted(false)
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      await fetch('/api/users/onboarding', { method: 'POST' })
      setCompleted(true)
    } catch (error) {
      console.error('Complete onboarding error:', error)
    }
  }

  return { completed, loading, completeOnboarding }
}
