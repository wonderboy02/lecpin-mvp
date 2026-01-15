"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"

const onboardingSteps = [
  {
    title: "LECPIN에 오신 것을 환영합니다",
    description: "강의 영상을 실습 과제로 바꿔주는 AI 학습 도우미입니다.",
    imageNote: "환영/시작하는 느낌의 이미지 - 밝은 작업 공간, 노트북이 열린 깔끔한 데스크",
  },
  {
    title: "강의를 입력하세요",
    description: "YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석합니다.",
    imageNote: "강의 시청 장면 - 모니터에 강의 영상이 재생되는 모습, 학습하는 분위기",
  },
  {
    title: "맞춤형 실습 과제",
    description: "분석 결과를 바탕으로 여러분에게 딱 맞는 실습 과제가 생성됩니다.",
    imageNote: "코딩/실습 장면 - 코드 에디터 화면, 키보드 타이핑하는 손",
  },
  {
    title: "시니어 수준의 피드백",
    description: "작성한 코드를 제출하면 시니어 개발자 수준의 AI 피드백을 받을 수 있습니다.",
    imageNote: "코드 리뷰/피드백 장면 - 코드에 코멘트가 달린 화면, 또는 토론하는 모습",
  },
  {
    title: "시작할 준비가 됐어요",
    description: "지금 바로 첫 번째 강의를 분석해보세요.",
    imageNote: "성취/시작 장면 - 준비된 작업 환경, 커피와 함께 시작하는 아침",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const isLastStep = currentStep === onboardingSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  const completeOnboarding = async () => {
    setIsCompleting(true)

    if (isLoggedIn) {
      try {
        await fetch('/api/users/onboarding', {
          method: 'POST',
        })
      } catch (error) {
        console.error('Failed to save onboarding status:', error)
      }
    }

    router.push('/dashboard')
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {onboardingSteps.map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`
                    w-2 h-2 rounded-full transition-colors
                    ${index <= currentStep ? 'bg-foreground' : 'bg-border'}
                  `}
                />
                {index < onboardingSteps.length - 1 && (
                  <div
                    className={`
                      h-px flex-1 mx-2
                      ${index < currentStep ? 'bg-foreground/30' : 'bg-border'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {currentStep + 1} / {onboardingSteps.length}
          </p>
        </div>

        {/* Content Card */}
        <div className="border border-border/60 rounded-sm bg-background">
          <div className="p-8 sm:p-10 text-center">
            {/* Image Placeholder */}
            <div className="aspect-video max-w-xs mx-auto bg-muted rounded-sm mb-8 relative overflow-hidden">
              {/*
                권장 이미지: {step.imageNote}
                - Unsplash, Pexels에서 검색
                - 따뜻한 톤, 자연스러운 라이팅
              */}
            </div>

            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground mb-3">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              {step.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 h-11"
                  disabled={isCompleting}
                >
                  이전
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 h-11"
                disabled={isCompleting}
              >
                {isCompleting ? "이동 중..." : isLastStep ? "시작하기" : "다음"}
              </Button>
            </div>
          </div>
        </div>

        {/* Skip Button */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="w-full mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isCompleting}
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  )
}
