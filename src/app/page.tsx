'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section - 2 Column */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Text Content */}
              <div className="animate-fade-in">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  AI 실습 코치
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6">
                  강의를 실습으로
                  <br />
                  실습을 성장으로
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                  YouTube 강의 URL을 입력하면 AI가 맞춤형 실습 과제를 설계하고,
                  시니어 개발자 수준의 코드 리뷰를 제공합니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="h-12 px-8">
                    <Link href="/login">GitHub로 시작하기</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 px-8"
                  >
                    <Link href="/guide">이용 가이드</Link>
                  </Button>
                </div>
              </div>

              {/* Right: Hero Video */}
              <div className="aspect-[4/3] bg-muted rounded-sm animate-fade-in animate-delay-100 relative overflow-hidden hidden lg:block">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/hero-main.webm" type="video/webm" />
                  <source src="/hero-main-optimized.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 border-t border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                문제
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                강의는 많이 들었는데,
                <br />
                만들어본 건 없지 않나요?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                수십 시간의 강의를 완강해도 막상 코드를 작성하려면 막막합니다.
                &lsquo;이해했다&rsquo;와 &lsquo;할 수 있다&rsquo;는 다른
                문제니까요.
              </p>
            </div>
          </div>
        </section>

        {/* Solution / Value Props Section */}
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                해결책
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                LECPIN이 강의와 실습 사이를
                <br />
                연결합니다
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium mb-6">
                  01
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">
                  강의 맞춤형 실습 과제
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI가 강의 내용을 분석해 핵심 역량을 추출하고, 그에 딱 맞는
                  실습 과제를 설계합니다. 더 이상 &lsquo;뭘 만들어볼까&rsquo;
                  고민할 필요 없습니다.
                </p>
              </div>

              <div className="animate-fade-in animate-delay-100">
                <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium mb-6">
                  02
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">
                  시니어 수준 코드 리뷰
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  혼자 공부하면 피드백을 받기 어렵습니다. AI가 코드 품질, 모범
                  사례, 개선점을 시니어 개발자처럼 상세히 리뷰해드립니다.
                </p>
              </div>

              <div className="animate-fade-in animate-delay-200">
                <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium mb-6">
                  03
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">
                  GitHub에 쌓이는 기록
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  모든 실습은 여러분의 GitHub 저장소에 남습니다. 강의를 들을
                  때마다 포트폴리오가 쌓이고, 성장의 흔적이 기록됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 border-t border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                이용 방법
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                3단계로 완성하는 실습
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center animate-fade-in">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  <picture>
                    <source srcSet="/guide/step1.webp" type="image/webp" />
                    <img
                      src="/guide/step1.jpg"
                      alt="강의 입력"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  강의 입력
                </h3>
                <p className="text-sm text-muted-foreground">
                  YouTube URL을 입력하면
                  <br />
                  AI가 내용을 분석합니다
                </p>
              </div>

              <div className="text-center animate-fade-in animate-delay-100">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  <picture>
                    <source srcSet="/guide/step3.webp" type="image/webp" />
                    <img
                      src="/guide/step3.jpg"
                      alt="과제 수행"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  과제 수행
                </h3>
                <p className="text-sm text-muted-foreground">
                  생성된 GitHub 저장소에서
                  <br />
                  과제를 완료합니다
                </p>
              </div>

              <div className="text-center animate-fade-in animate-delay-200">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  <picture>
                    <source srcSet="/guide/step6.webp" type="image/webp" />
                    <img
                      src="/guide/step6.jpg"
                      alt="AI 피드백"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  AI 피드백
                </h3>
                <p className="text-sm text-muted-foreground">
                  코드 제출 후 즉시
                  <br />
                  상세한 리뷰를 받습니다
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Button asChild variant="outline" size="sm">
                <Link href="/guide">자세한 이용 방법 보기 &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Start Section */}
        <section id="start" className="py-24 bg-foreground text-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                {/* 실제 UI 프리뷰 */}
                <div className="relative">
                  {/* 메인 카드 */}
                  <div className="bg-background text-foreground rounded-sm shadow-2xl overflow-hidden">
                    {/* 브라우저 상단 바 */}
                    <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border/50">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/60" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                        <div className="w-3 h-3 rounded-full bg-green-400/60" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-background/80 rounded-sm px-3 py-1 text-xs text-muted-foreground max-w-[200px]">
                          lecpin.com
                        </div>
                      </div>
                    </div>

                    {/* 컨텐츠 */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                        강의 입력
                      </p>
                      <div className="space-y-3">
                        <div className="h-10 bg-muted rounded-sm border border-border flex items-center px-3">
                          <span className="text-sm text-muted-foreground">
                            https://youtube.com/watch?v=...
                          </span>
                        </div>
                        <div className="h-11 bg-foreground rounded-sm flex items-center justify-center">
                          <span className="text-sm font-medium text-background">
                            분석 시작
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 데코레이션 요소 */}
                  <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-background/20 rounded-sm -z-10" />
                  <div className="absolute -bottom-8 -right-8 w-full h-full border border-background/10 rounded-sm -z-20" />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="text-xs font-medium tracking-widest uppercase text-background/60 mb-4">
                  시작하기
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-background">
                  첫 번째 실습을
                  <br />
                  시작해보세요
                </h2>
                <p className="text-background/70 leading-relaxed mb-8 max-w-md">
                  GitHub 계정으로 로그인하면 바로 강의 URL을 입력하고 맞춤형
                  실습 과제를 받아볼 수 있습니다.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 bg-background text-foreground hover:bg-background/90"
                >
                  <Link href="/login">GitHub로 로그인하고 시작하기</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="font-serif text-3xl font-semibold text-foreground mb-2">
                  codex
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  AI 모델
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-foreground mb-2">
                  100점
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  코드 리뷰 점수제
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-foreground mb-2">
                  GitHub
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  저장소 자동 생성
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-foreground mb-2">
                  무제한
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  재시도 가능
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 border-t border-border">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              시작할 준비가 되셨나요?
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              다음 강의부터는
              <br />
              직접 만들어보세요
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              듣기만 하는 학습은 이제 그만.
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/login">무료로 시작하기</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
