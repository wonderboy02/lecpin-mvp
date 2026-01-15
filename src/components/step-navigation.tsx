"use client"

import { Button } from "@/components/ui/button"
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
    <nav className="mb-10" aria-label="Progress">
      {/* Step Indicators */}
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key
          const stepCompleted = isStepCompleted(step.key)
          const isClickable = isStepClickable(step.key)
          const isLast = index === steps.length - 1

          return (
            <div key={step.key} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center flex-1 transition-all
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2
                    ${isActive
                      ? 'bg-foreground text-background'
                      : stepCompleted
                        ? 'bg-foreground/20 text-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {stepCompleted && !isActive ? '✓' : index + 1}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    text-xs font-medium
                    ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    h-px flex-1 mx-2
                    ${stepCompleted ? 'bg-foreground/30' : 'bg-border'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="text-center mt-4">
          <span className="px-3 py-1 text-xs font-medium rounded-sm bg-foreground text-background">
            과제 완료
          </span>
        </div>
      )}

      {/* Navigation Buttons */}
      {showNavButtons && !isCompleted && (
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            &larr; 이전
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === steps.length - 1 || !isStepCompleted(currentStep)}
          >
            다음 &rarr;
          </Button>
        </div>
      )}
    </nav>
  )
}
