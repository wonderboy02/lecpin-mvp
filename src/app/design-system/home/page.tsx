"use client"

/**
 * 홈페이지 목업 (디자인 시스템 적용)
 *
 * 주요 요소:
 * - Header (로고 + 네비게이션)
 * - Hero 섹션 (타이틀 + 서브타이틀)
 * - 강의 URL 입력 폼
 * - 대시보드 바로가기 (로그인 시)
 * - Footer
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function HomeMockup() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/design-system" className="font-serif text-xl font-semibold tracking-tight">
            LECPIN
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/design-system/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              내 학습
            </Link>
            <Button variant="outline" size="sm">로그인</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Text Content */}
              <div className="animate-fade-in">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  AI 실습 코치
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6">
                  강의를 실습으로<br />
                  바꿔보세요
                </h1>
                <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
                  YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고
                  맞춤형 실습 과제를 생성해드립니다.
                </p>

                {/* Quick Access - Logged In User */}
                <div className="flex items-center gap-4 mb-10">
                  <Button variant="outline" className="group">
                    <span>내 학습 대시보드</span>
                    <span className="ml-2 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </Button>
                </div>
              </div>

              {/* Right: Image */}
              <div className="aspect-[4/3] bg-muted rounded-sm animate-fade-in animate-delay-100 relative overflow-hidden">
                {/*
                  권장 이미지: 노트북에서 강의를 보는 장면
                  - 화면에 YouTube 또는 강의 영상이 보이는 모습
                  - 옆에 노트와 펜이 있는 구도
                  - 자연광이 들어오는 데스크 환경
                  - 학습하는 분위기 전달

                  검색 키워드: "online learning laptop", "studying with laptop notes"
                */}
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/60">
                  Hero Image (4:3)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lecture Input Section */}
        <section className="py-16 border-t border-border">
          <div className="max-w-2xl mx-auto px-6">
            <Card className="border-border/60">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl font-semibold mb-2">강의 분석 시작하기</h2>
                  <p className="text-sm text-muted-foreground">
                    YouTube 강의 URL을 입력하세요
                  </p>
                </div>

                {/* URL Input */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground block mb-2">
                      강의 URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      className="h-12"
                    />
                  </div>

                  <Button className="w-full h-12">
                    분석 시작
                  </Button>
                </div>

                {/* Example URLs */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    예시 강의
                  </p>
                  <div className="space-y-2">
                    {[
                      "React Hooks 완벽 가이드",
                      "TypeScript 기초부터 실전까지",
                      "Node.js 백엔드 구축하기"
                    ].map((title, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-3 rounded-sm bg-muted/50 hover:bg-muted text-sm transition-colors"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                이용 방법
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight">
                3단계로 완성하는 실습
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  {/*
                    권장 이미지: YouTube 강의 화면
                    - 모니터에 강의 영상이 재생되는 모습
                    - 코딩 관련 강의 내용이 살짝 보이는 정도
                    - 깔끔한 구도

                    검색 키워드: "youtube tutorial screen", "online course monitor"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/60">
                    Step 1 Image
                  </div>
                </div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Step 01
                </p>
                <h3 className="font-serif text-xl font-semibold mb-2">강의 입력</h3>
                <p className="text-sm text-muted-foreground">
                  YouTube URL을 입력하면<br />AI가 내용을 분석합니다
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  {/*
                    권장 이미지: 분석 결과 / 구조화된 정보
                    - 화이트보드에 그린 다이어그램
                    - 노트에 정리된 마인드맵
                    - 깔끔하게 정리된 학습 자료

                    검색 키워드: "whiteboard planning", "structured notes", "mind map notebook"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/60">
                    Step 2 Image
                  </div>
                </div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Step 02
                </p>
                <h3 className="font-serif text-xl font-semibold mb-2">과제 생성</h3>
                <p className="text-sm text-muted-foreground">
                  핵심 역량 기반<br />맞춤형 과제가 생성됩니다
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  {/*
                    권장 이미지: 코드 리뷰 / 피드백
                    - 코드가 보이는 화면과 코멘트
                    - 코드 에디터에서 리뷰하는 모습
                    - pair programming 느낌

                    검색 키워드: "code review screen", "pair programming", "developer feedback"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/60">
                    Step 3 Image
                  </div>
                </div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Step 03
                </p>
                <h3 className="font-serif text-xl font-semibold mb-2">AI 피드백</h3>
                <p className="text-sm text-muted-foreground">
                  시니어 개발자 수준의<br />코드 리뷰를 받습니다
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-serif text-lg font-semibold">LECPIN</p>
            <p className="text-sm text-muted-foreground">
              2025 LECPIN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
