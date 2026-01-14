'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState, useCallback } from 'react'

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  github_username: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, github_username')
      .eq('id', userId)
      .single()
    return data
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // onAuthStateChange가 즉시 INITIAL_SESSION 이벤트를 발생시킴
    // 이것이 초기 상태를 설정하는 유일한 방법
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 현재 유저 설정
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // 프로필은 별도로 fetch (onAuthStateChange 콜백 내에서 직접 Supabase 호출 피하기)
          // setTimeout을 사용해 콜백 외부에서 실행
          setTimeout(async () => {
            const profileData = await fetchProfile(currentUser.id)
            setProfile(profileData)
            setLoading(false)
          }, 0)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isLoggedIn: !!user,
  }
}
