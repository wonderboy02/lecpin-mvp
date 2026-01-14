"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import type { Step } from "@/types"

const steps: { key: Step; label: string }[] = [
  { key: "summary", label: "역량 분석" },
  { key: "task", label: "실습 과제" },
  { key: "submit", label: "결과 제출" },
  { key: "feedback", label: "피드백" },
]

interface StepNavigationProps {
  currentStep: Step
  completedSteps: Step[]
  onStepClick: (step: Step) => void
  onPrevious?: () => void
  onNext?: () => void
  showNavButtons?: boolean
  disableFutureSteps?: boolean
}

export function StepNavigation({
  currentStep,
  completedSteps,
  onStepClick,
  onPrevious,
  onNext,
  showNavButtons = false,
  disableFutureSteps = true,
}: StepNavigationProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep)
  const isCompleted = currentStep === 'completed'

  const isStepClickable = (stepKey: Step) => {
    if (!disableFutureSteps) return true
    return completedSteps.includes(stepKey) || stepKey === currentStep || isCompleted
  }

  const isStepCompleted = (stepKey: Step) => {
    return completedSteps.includes(stepKey) || isCompleted
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].key
      onStepClick(prevStep)
      onPrevious?.()
    }
  }

  const handleNext = () => {
    if (currentIndex < steps.length - 1 && isStepCompleted(currentStep)) {
      const nextStep = steps[currentIndex + 1].key
      onStepClick(nextStep)
      onNext?.()
    }
  }

  return (
    <nav className="space-y-4 mb-8" aria-label="Progress">
      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key
          const stepCompleted = isStepCompleted(step.key)
          const isClickable = isStepClickable(step.key)

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center transition-all duration-300
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300 mb-2
                    ${isActive
                      ? 'bg-foreground text-background'
                      : stepCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }
                    ${isClickable && !isActive ? 'hover:bg-muted-foreground/20' : ''}
                  `}
                >
                  {stepCompleted && !isActive ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    text-xs font-medium tracking-wide transition-colors duration-300
                    ${isActive
                      ? 'text-foreground'
                      : stepCompleted
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    hidden sm:block w-12 lg:w-20 h-px mx-3
                    transition-colors duration-300
                    ${stepCompleted ? 'bg-green-500/50' : 'bg-border'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="text-center">
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            과제 완료
          </span>
        </div>
      )}

      {/* Navigation Buttons */}
      {showNavButtons && !isCompleted && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === steps.length - 1 || !isStepCompleted(currentStep)}
            className="gap-2"
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </nav>
  )
}
