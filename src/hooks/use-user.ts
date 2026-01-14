'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const supabase = createClient()

    // 현재 세션 가져오기
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from('users')
          .select('id, email, name, avatar_url, github_username')
          .eq('id', user.id)
          .single()

        setProfile(profileData)
      }

      setLoading(false)
    }

    getUser()

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: profileData } = await supabase
            .from('users')
            .select('id, email, name, avatar_url, github_username')
            .eq('id', session.user.id)
            .single()

          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
