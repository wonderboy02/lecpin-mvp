'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const redirect = searchParams.get('redirect') || '/'

  const handleGitHubLogin = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
        scopes: 'read:user user:email repo', // repo 권한으로 repository 생성 가능
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Lecpin에 오신 것을 환영합니다</CardTitle>
          <CardDescription>
            강의를 분석하고 실습 과제를 통해 학습하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
              로그인 중 오류가 발생했습니다. 다시 시도해주세요.
            </div>
          )}

          <Button
            onClick={handleGitHubLogin}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            GitHub로 로그인
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            로그인하면 실습 과제를 위한 GitHub 저장소를 생성할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">로딩 중...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
