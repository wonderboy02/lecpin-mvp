"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const onboardingSteps = [
  {
    title: "Lecpin에 오신 것을 환영합니다!",
    description: "강의 영상을 실습 과제로 바꿔주는 AI 학습 도우미입니다.",
    emoji: "👋",
  },
  {
    title: "1단계: 강의 분석",
    description: "YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석합니다.",
    emoji: "🎬",
  },
  {
    title: "2단계: 실습 과제",
    description: "분석 결과를 바탕으로 맞춤형 실습 과제가 자동 생성됩니다.",
    emoji: "📝",
  },
  {
    title: "3단계: 코드 리뷰",
    description: "작성한 코드를 제출하면 시니어 개발자 수준의 AI 피드백을 받을 수 있습니다.",
    emoji: "✨",
  },
  {
    title: "시작할 준비가 됐어요!",
    description: "지금 바로 첫 번째 강의를 분석해보세요.",
    emoji: "🚀",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const isLastStep = currentStep === onboardingSteps.length - 1
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

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

    router.push('/')
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground text-right mt-2">
            {currentStep + 1} / {onboardingSteps.length}
          </p>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Emoji 영역 */}
            <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <span className="text-6xl">{step.emoji}</span>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-3">
              {step.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {step.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                  disabled={isCompleting}
                >
                  이전
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={isCompleting}
              >
                {isCompleting ? "이동 중..." : isLastStep ? "시작하기" : "다음"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Button */}
        {!isLastStep && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full mt-4 text-muted-foreground"
            disabled={isCompleting}
          >
            건너뛰기
          </Button>
        )}
      </div>
    </div>
  )
}
