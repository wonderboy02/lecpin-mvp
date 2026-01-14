import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { TablesUpdate } from '@/lib/supabase/database'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()

    // OAuth 코드를 세션으로 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // GitHub provider_token 저장 (GitHub API 호출에 필요)
      const providerToken = data.session.provider_token
      const user = data.session.user

      if (providerToken && user) {
        // Service client로 github_token 저장 (RLS 우회)
        const serviceClient = createServiceClient()

        const updateData: TablesUpdate<'users'> = {
          github_token: providerToken,
          github_username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || null
        }

        await serviceClient
          .from('users')
          .update(updateData as never)
          .eq('id', user.id)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
