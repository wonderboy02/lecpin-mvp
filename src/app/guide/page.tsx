"use client"

/**
 * 가이드 페이지 (디자인 시스템 적용)
 *
 * 주요 요소:
 * - Header + Footer (공통 컴포넌트)
 * - Hero 섹션 (타이틀 + 설명)
 * - 이용 방법 6단계 (4:3 이미지 + 설명)
 * - FAQ 섹션
 * - CTA 섹션
 */

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    number: "01",
    title: "강의 영상 입력",
    description: "학습하고 싶은 YouTube 강의 URL을 입력하세요. AI가 강의 내용을 분석합니다.",
    imageNote: "YouTube 강의 화면이 보이는 모니터 - 코딩 관련 강의 내용",
  },
  {
    number: "02",
    title: "역량 분석",
    description: "AI가 강의에서 배울 수 있는 핵심 역량을 추출하고 요약합니다.",
    imageNote: "화이트보드에 그린 다이어그램 또는 노트에 정리된 마인드맵",
  },
  {
    number: "03",
    title: "실습 과제 생성",
    description: "분석된 역량을 기반으로 맞춤형 실습 과제가 자동 생성됩니다.",
    imageNote: "코드 에디터 화면 - 깔끔한 코드가 보이는 다크 테마",
  },
  {
    number: "04",
    title: "GitHub 레포 생성",
    description: "클릭 한 번으로 과제용 GitHub 저장소가 생성됩니다. README에 과제 내용이 포함됩니다.",
    imageNote: "GitHub 저장소 화면 또는 터미널에서 git 명령어 실행 장면",
  },
  {
    number: "05",
    title: "코드 작성 & 제출",
    description: "과제를 완료하고 코드를 푸시한 후 제출 버튼을 누르세요.",
    imageNote: "키보드 타이핑하는 손 또는 코드를 작성하는 집중하는 모습",
  },
  {
    number: "06",
    title: "AI 코드 리뷰",
    description: "시니어 개발자 수준의 AI가 코드를 분석하고 상세한 피드백을 제공합니다.",
    imageNote: "코드 리뷰 화면 - 코드에 코멘트가 달린 모습",
  },
]

const faqs = [
  {
    question: "어떤 종류의 강의를 분석할 수 있나요?",
    answer: "프로그래밍, 개발, 기술 관련 YouTube 강의를 분석할 수 있습니다. 자막이 있는 강의가 더 정확한 분석이 가능합니다.",
  },
  {
    question: "GitHub 계정이 필요한가요?",
    answer: "네, GitHub 계정으로 로그인해야 합니다. 실습 과제를 위한 저장소 생성과 코드 제출에 사용됩니다.",
  },
  {
    question: "AI 피드백은 얼마나 정확한가요?",
    answer: "GPT-4o 기반으로 시니어 개발자 수준의 코드 리뷰를 제공합니다. 코드 품질, 모범 사례, 개선점 등을 종합적으로 분석합니다.",
  },
  {
    question: "한국어로 피드백을 받을 수 있나요?",
    answer: "네, 헤더에서 언어를 선택하면 영어 강의도 한국어로 분석 및 피드백을 받을 수 있습니다.",
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Text Content */}
              <div className="animate-fade-in">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  이용 가이드
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6">
                  강의를 실습으로<br />
                  실습을 성장으로
                </h1>
                <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
                  LECPIN은 YouTube 강의를 실습 과제로 바꿔주는 AI 학습 도우미입니다.
                  6단계 프로세스로 이론을 실전 역량으로 전환하세요.
                </p>
                <Button asChild size="lg" className="h-12 px-8">
                  <Link href="/">지금 시작하기</Link>
                </Button>
              </div>

              {/* Right: Hero Image */}
              <div className="aspect-[4/3] bg-muted rounded-sm animate-fade-in animate-delay-100 relative overflow-hidden">
                {/*
                  권장 이미지: 학습하는 개발자의 모습
                  - 노트북 앞에서 집중하는 장면
                  - 화면에는 코드나 강의가 살짝 보이는 정도
                  - 자연광이 들어오는 깔끔한 데스크 환경

                  검색 키워드: "developer learning laptop", "studying programming"
                */}
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/60">
                  Hero Image (4:3)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-border" />
        </div>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                이용 방법
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight mb-4">
                어떻게 동작하나요?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                강의 영상을 입력하면 AI가 핵심 역량을 분석하고,
                여러분에게 딱 맞는 실습 과제를 생성합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`animate-fade-in animate-delay-${(index + 1) * 100}`}
                >
                  <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden">
                    {/*
                      권장 이미지: {step.imageNote}
                      - Unsplash, Pexels에서 검색
                      - 따뜻한 톤, 자연스러운 라이팅
                    */}
                    <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/60">
                      Step {step.number} Image
                    </div>
                  </div>
                  <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                    Step {step.number}
                  </p>
                  <h3 className="font-serif text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-border" />
        </div>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                FAQ
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight">
                자주 묻는 질문
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 border border-border/60 rounded-sm"
                >
                  <h3 className="font-medium text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-0.5 bg-foreground" />
        </div>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight mb-4">
              준비되셨나요?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              지금 바로 강의를 입력하고 실습을 시작해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/">강의 분석 시작</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link href="/login">GitHub로 로그인</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
