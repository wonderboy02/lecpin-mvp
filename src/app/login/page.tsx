'use client';

/**
 * 로그인 페이지 (디자인 시스템 적용)
 *
 * 주요 요소:
 * - 심플한 Header (로고만)
 * - 2컬럼 레이아웃 (이미지 + 로그인 폼)
 * - GitHub OAuth 로그인
 */

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const redirect = searchParams.get('redirect') || '/';

  const handleGitHubLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
        scopes: 'read:user user:email repo',
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="font-serif text-xl font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity"
          >
            LECPIN
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image */}
            <div className="aspect-[4/2.9] bg-muted rounded-sm relative overflow-hidden hidden lg:block border border-border/40">
              <Image
                src="/guide/hero-login.jpeg"
                alt="커피와 함께 작업을 시작하는 데스크 환경"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 0vw, 50vw"
              />
            </div>

            {/* Right: Login Form */}
            <div className="max-w-sm mx-auto lg:mx-0 w-full">
              <div className="mb-10">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  시작하기
                </p>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground mb-3">
                  모든 강의에
                  <br />
                  실습을 더합니다
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  보는 강의가 진짜 남는 강의로 바뀝니다
                </p>
              </div>

              <div className="border border-border/60 rounded-sm p-8">
                {/* Value Propositions */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground mt-0.5">∙</span>
                    <span className="text-foreground">
                      강의 내용 기반 맞춤형 실습 과제
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground mt-0.5">∙</span>
                    <span className="text-foreground">
                      시니어 개발자 수준의 코드 리뷰
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground mt-0.5">∙</span>
                    <span className="text-foreground">
                      내 GitHub에 쌓이는 실습 기록
                    </span>
                  </li>
                </ul>

                {error && (
                  <div className="p-4 mb-6 text-sm text-foreground bg-muted/50 border border-border/60 rounded-sm">
                    로그인 중 오류가 발생했습니다. 다시 시도해주세요.
                  </div>
                )}

                <Button
                  onClick={handleGitHubLogin}
                  className="w-full h-12 text-base font-medium"
                >
                  GitHub로 계속하기
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
                  계정이 없어도 바로 시작할 수 있습니다
                </p>
              </div>

              {/* Links */}
              <div className="mt-8 flex items-center justify-center gap-6">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  홈으로
                </Link>
                <span className="text-border">|</span>
                <Link
                  href="/guide"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  이용 가이드
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-sm text-muted-foreground">
            2025 LECPIN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
