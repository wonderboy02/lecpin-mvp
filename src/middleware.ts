import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신 (중요: getUser()는 서버에서 토큰 검증)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 온보딩 완료 여부 확인 (로그인된 경우만)
  let onboardingCompleted = true
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    onboardingCompleted = profile?.onboarding_completed ?? false
  }

  // 온보딩 미완료 시 온보딩 페이지로 리다이렉트 (온보딩 페이지 및 테스트 페이지 제외)
  if (user && !onboardingCompleted && request.nextUrl.pathname !== '/onboarding' && !request.nextUrl.pathname.startsWith('/onboarding/test')) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  // 온보딩 완료 후 온보딩 페이지 접근 시 대시보드로 리다이렉트 (테스트 페이지는 제외)
  if (user && onboardingCompleted && request.nextUrl.pathname === '/onboarding') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 로그인 필요 페이지 보호
  const protectedPaths = ['/dashboard', '/lectures', '/tasks']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 이미 로그인된 사용자가 /login 접근 시 대시보드로 리다이렉트
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 로그인된 사용자가 / (랜딩) 접근 시 대시보드로 리다이렉트
  if (request.nextUrl.pathname === '/' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
