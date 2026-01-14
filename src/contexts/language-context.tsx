"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useUser } from '@/hooks/use-user'
import type { Language } from '@/types'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { profile, isLoggedIn } = useUser()
  const [language, setLanguageState] = useState<Language>('ko')
  const [isLoading, setIsLoading] = useState(false)

  // 프로필에서 언어 설정 로드
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language as Language)
    }
  }, [profile])

  // 언어 변경 (DB 저장)
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang)  // 즉시 UI 반영

    if (!isLoggedIn) {
      // 비로그인 시 로컬스토리지에만 저장
      localStorage.setItem('preferred_language', lang)
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/users/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      })

      if (!res.ok) {
        console.error('Failed to update language')
        // 실패 시 롤백하지 않음 (UI는 유지)
      }
    } catch (error) {
      console.error('Language update error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  // 비로그인 시 로컬스토리지에서 로드
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('preferred_language') as Language
      if (saved && (saved === 'ko' || saved === 'en')) {
        setLanguageState(saved)
      }
    }
  }, [isLoggedIn])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
