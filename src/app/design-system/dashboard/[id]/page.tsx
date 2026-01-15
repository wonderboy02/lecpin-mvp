"use client"

import Link from "next/link"

/**
 * 대시보드 상세 페이지 목업 (디자인 시스템 적용)
 *
 * 주요 요소:
 * - Header
 * - 뒤로가기 버튼
 * - Step Navigation (역량 분석 > 실습 과제 > 결과 제출 > 피드백)
 * - 각 단계별 컨텐츠:
 *   - 역량 분석: 핵심 역량 리스트
 *   - 실습 과제: 과제 설명 + 요구사항
 *   - 결과 제출: 코드 업로드 폼
 *   - 피드백: AI 피드백 결과
 * - Footer
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const steps = [
  { key: "summary", label: "역량 분석" },
  { key: "task", label: "실습 과제" },
  { key: "submit", label: "결과 제출" },
  { key: "feedback", label: "피드백" },
]

const currentStep = "task" // 현재 단계 (목업용)

const mockCompetencies = [
  {
    title: "useState Hook 활용",
    description: "컴포넌트의 로컬 상태를 관리하고 업데이트하는 방법",
    level: "기초",
  },
  {
    title: "useEffect Hook 이해",
    description: "사이드 이펙트를 처리하고 cleanup 함수를 작성하는 방법",
    level: "기초",
  },
  {
    title: "Custom Hook 설계",
    description: "재사용 가능한 로직을 커스텀 훅으로 추출하는 패턴",
    level: "중급",
  },
]

const mockTask = {
  title: "Custom Hook으로 폼 상태 관리하기",
  description: "강의에서 배운 useState와 useEffect를 활용하여 재사용 가능한 폼 상태 관리 Custom Hook을 구현합니다.",
  requirements: [
    "useForm 커스텀 훅 생성",
    "입력 값 변경 핸들러 구현",
    "유효성 검사 로직 추가",
    "폼 제출 핸들러 구현",
  ],
  hints: [
    "useState로 values, errors 상태 관리",
    "useCallback으로 핸들러 메모이제이션",
    "제네릭을 활용한 타입 안전성 확보",
  ],
}

export default function TaskDetailMockup() {
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
            <div className="w-8 h-8 rounded-full bg-muted" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Back Button */}
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            <span>대시보드로 돌아가기</span>
          </button>

          {/* Lecture Title */}
          <div className="mb-8">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
              학습 중
            </p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              React Hooks 완벽 가이드
            </h1>
          </div>

          {/* Step Navigation */}
          <div className="mb-10">
            <div className="flex items-center">
              {steps.map((step, index) => {
                const isActive = step.key === currentStep
                const isPast = steps.findIndex(s => s.key === currentStep) > index
                const isLast = index === steps.length - 1

                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <button
                      className={`
                        flex flex-col items-center gap-2 flex-1
                        ${isActive || isPast ? 'cursor-pointer' : 'cursor-default'}
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isActive
                          ? 'bg-foreground text-background'
                          : isPast
                            ? 'bg-foreground/20 text-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {isPast ? '✓' : index + 1}
                      </div>
                      <span className={`
                        text-xs font-medium
                        ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {step.label}
                      </span>
                    </button>

                    {!isLast && (
                      <div className={`
                        h-px flex-1 mx-2
                        ${isPast ? 'bg-foreground/30' : 'bg-border'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content: 역량 분석 */}
          <div className="hidden animate-fade-in">
            <Card className="border-border/60 mb-6">
              <CardHeader>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  역량 분석 결과
                </p>
                <CardTitle className="font-serif text-xl">
                  이 강의에서 배울 수 있는 핵심 역량
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCompetencies.map((comp, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{comp.title}</h4>
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">
                          {comp.level}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">
              실습 과제 생성하기
            </Button>
          </div>

          {/* Step Content: 실습 과제 (현재 표시) */}
          <div className="animate-fade-in">
            <Card className="border-border/60 mb-6">
              <CardHeader>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  실습 과제
                </p>
                <CardTitle className="font-serif text-xl">
                  {mockTask.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Task Description */}
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {mockTask.description}
                  </p>
                </div>

                {/* Task Image */}
                <div className="aspect-video bg-muted rounded-sm relative">
                  {/*
                    권장 이미지: 과제 관련 시각 자료
                    - 코드 구조 다이어그램
                    - 컴포넌트 흐름도
                    - 간단한 아키텍처 스케치
                    - 또는 코드 에디터 화면

                    검색 키워드: "react architecture diagram", "code structure sketch", "component flow"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/60">
                    과제 관련 다이어그램 또는 참고 이미지
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    요구사항
                  </h4>
                  <ul className="space-y-2">
                    {mockTask.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hints */}
                <div className="p-4 bg-muted/50 rounded-sm">
                  <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    힌트
                  </h4>
                  <ul className="space-y-1.5">
                    {mockTask.hints.map((hint, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">
              실습 시작하기
            </Button>
          </div>

          {/* Step Content: 결과 제출 */}
          <div className="hidden animate-fade-in">
            <Card className="border-border/60 mb-6">
              <CardHeader>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  결과 제출
                </p>
                <CardTitle className="font-serif text-xl">
                  작성한 코드를 제출하세요
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground block mb-2">
                    코드 입력
                  </label>
                  <Textarea
                    className="min-h-[300px] font-mono text-sm resize-none"
                    placeholder="// 여기에 코드를 붙여넣으세요..."
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-sm">
                  <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                    제출 전 확인사항
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 모든 요구사항을 구현했는지 확인하세요</li>
                    <li>• 코드가 정상적으로 동작하는지 테스트하세요</li>
                    <li>• 불필요한 console.log는 제거하세요</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">
              제출하고 피드백 받기
            </Button>
          </div>

          {/* Step Content: 피드백 */}
          <div className="hidden animate-fade-in">
            <Card className="border-border/60 mb-6">
              <CardHeader>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  AI 피드백
                </p>
                <CardTitle className="font-serif text-xl">
                  코드 리뷰 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score */}
                <div className="flex items-center gap-6 p-6 bg-muted/50 rounded-sm">
                  <div className="text-center">
                    <p className="font-serif text-4xl font-semibold">85</p>
                    <p className="text-xs text-muted-foreground mt-1">총점</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>요구사항 충족</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>코드 품질</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>베스트 프랙티스</span>
                      <span className="font-medium">80%</span>
                    </div>
                  </div>
                </div>

                {/* Feedback Detail */}
                <div>
                  <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    상세 피드백
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">잘한 점</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Custom Hook의 기본 구조가 잘 설계되었습니다. 상태 분리와 핸들러 구현이 깔끔합니다.
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium">개선할 점</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        useCallback을 사용하여 핸들러 함수를 메모이제이션하면 불필요한 리렌더링을 방지할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                다시 제출하기
              </Button>
              <Button className="flex-1">
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        </div>
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
