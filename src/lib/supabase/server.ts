/**
 * Supabase Server Client
 * 
 * Server Components, Route Handlers, Server Actions에서 사용
 * 
 * @example
 * ```ts
 * import { createClient } from '@/lib/supabase/server'
 * 
 * export async function GET() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('users').select()
 *   // ...
 * }
 * ```
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 무시
            // Middleware에서 세션 갱신 처리
          }
        },
      },
    }
  )
}

/**
 * Service Role Client (Admin 작업용)
 * 
 * RLS를 우회해야 하는 서버 작업에서만 사용
 * ⚠️ 주의: 클라이언트에 노출되면 안됨
 */
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
