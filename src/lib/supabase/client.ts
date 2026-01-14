/**
 * Supabase Browser Client
 * 
 * 클라이언트 컴포넌트('use client')에서 사용
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export function MyComponent() {
 *   const supabase = createClient()
 *   // ...
 * }
 * ```
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
