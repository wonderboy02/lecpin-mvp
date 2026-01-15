"use client"

/**
 * 온보딩 페이지 목업 (디자인 시스템 적용)
 *
 * 기존 요소:
 * - Progress bar
 * - 카드형 온보딩 슬라이드 (이모지 + 제목 + 설명)
 * - 이전/다음/건너뛰기 버튼
 *
 * 변경사항:
 * - 이모지 제거 → 사진 placeholder로 대체
 * - 에디토리얼 스타일 적용
 * - 더 큰 이미지와 여백
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"

const onboardingSteps = [
  {
    title: "Lecpin에 오신 것을 환영합니다",
    description: "강의 영상을 실습 과제로 바꿔주는 AI 학습 도우미입니다.",
    imageNote: "환영/시작하는 느낌의 이미지 - 밝은 작업 공간, 노트북이 열린 깔끔한 데스크",
    imageKeywords: "welcome workspace bright desk laptop",
  },
  {
    title: "강의를 입력하세요",
    description: "YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석합니다.",
    imageNote: "강의 시청 장면 - 모니터에 강의 영상이 재생되는 모습, 학습하는 분위기",
    imageKeywords: "watching tutorial laptop learning online course",
  },
  {
    title: "맞춤형 실습 과제",
    description: "분석 결과를 바탕으로 여러분에게 딱 맞는 실습 과제가 생성됩니다.",
    imageNote: "코딩/실습 장면 - 코드 에디터 화면, 키보드 타이핑하는 손",
    imageKeywords: "coding practice hands keyboard programmer working",
  },
  {
    title: "시니어 수준의 피드백",
    description: "작성한 코드를 제출하면 시니어 개발자 수준의 AI 피드백을 받을 수 있습니다.",
    imageNote: "코드 리뷰/피드백 장면 - 코드에 코멘트가 달린 화면, 또는 토론하는 모습",
    imageKeywords: "code review feedback discussion mentor programming",
  },
  {
    title: "시작할 준비가 됐어요",
    description: "지금 바로 첫 번째 강의를 분석해보세요.",
    imageNote: "성취/시작 장면 - 준비된 작업 환경, 커피와 함께 시작하는 아침",
    imageKeywords: "ready to start fresh morning desk coffee laptop",
  },
]

export default function OnboardingMockup() {
  const [currentStep, setCurrentStep] = useState(0)

  const isLastStep = currentStep === onboardingSteps.length - 1
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Minimal */}
      <header className="py-6">
        <div className="max-w-lg mx-auto px-6">
          <a href="/design-system" className="font-serif text-xl font-semibold tracking-tight">
            LECPIN
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-lg mx-auto px-6 w-full">
          {/* Progress */}
          <div className="mb-10">
            <div className="h-0.5 bg-border overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                {currentStep + 1} / {onboardingSteps.length}
              </p>
              {!isLastStep && (
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  건너뛰기
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-in" key={currentStep}>
            {/* Image */}
            <div className="aspect-[4/3] bg-muted rounded-sm mb-8 relative overflow-hidden">
              {/*
                각 단계별 권장 이미지:

                Step 1 (환영):
                - 밝고 깔끔한 작업 공간
                - 노트북이 열린 미니멀 데스크
                - 자연광이 들어오는 환경

                Step 2 (강의 입력):
                - 모니터에 강의 영상이 재생되는 모습
                - 학습하며 노트하는 장면
                - 집중해서 영상을 보는 모습

                Step 3 (실습 과제):
                - 코드 에디터 화면
                - 키보드 타이핑하는 손 클로즈업
                - 코딩하는 집중된 분위기

                Step 4 (피드백):
                - 코드 리뷰가 진행되는 화면
                - 코드에 코멘트가 달린 모습
                - 또는 멘토링/토론 장면

                Step 5 (시작):
                - 준비된 깔끔한 작업 환경
                - 커피와 함께 시작하는 아침
                - 시작의 설렘이 느껴지는 분위기
              */}
              <div className="absolute bottom-3 left-3 right-3 text-xs text-muted-foreground/60">
                {step.imageNote}
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl font-semibold tracking-tight mb-3">
                {step.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  이전
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {isLastStep ? "시작하기" : "다음"}
              </Button>
            </div>
          </div>

          {/* Step Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {onboardingSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`
                  w-2 h-2 rounded-full transition-colors
                  ${i === currentStep ? 'bg-foreground' : 'bg-border hover:bg-muted-foreground'}
                `}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="py-6">
        <div className="max-w-lg mx-auto px-6">
          <p className="text-xs text-muted-foreground text-center">
            2025 LECPIN
          </p>
        </div>
      </footer>
    </div>
  )
}
