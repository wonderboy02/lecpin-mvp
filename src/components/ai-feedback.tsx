"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Submission, Feedback, ImprovementItem, FeedbackItem } from "@/types"

interface AIFeedbackProps {
  submission: Submission
  feedback: Feedback | null
  onFeedbackGenerated: (feedback: Feedback) => void
  onReset: () => void
}

export function AIFeedback({
  submission,
  feedback,
  onFeedbackGenerated,
  onReset,
}: AIFeedbackProps) {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(!feedback)
  const [error, setError] = useState<string | null>(null)
  const fetchedSubmissionIdRef = useRef<string | null>(null)

  useEffect(() => {
    // 이미 피드백이 있으면 실행하지 않음
    if (feedback) return
    // 같은 submission에 대해 이미 요청했으면 실행하지 않음 (중복 요청 방지)
    if (fetchedSubmissionIdRef.current === submission.id) return
    fetchedSubmissionIdRef.current = submission.id

    const generateFeedback = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/feedback/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submission_id: submission.id, language }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "피드백 생성에 실패했습니다.")
        }

        onFeedbackGenerated(data.feedback)
      } catch (err) {
        setError(err instanceof Error ? err.message : "피드백 생성 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    generateFeedback()
  }, [submission.id, feedback, onFeedbackGenerated, language])

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
        return "심각"
      case "major":
        return "중요"
      case "minor":
        return "권장"
      case "suggestion":
        return "제안"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">
              AI가 코드를 분석하고 있습니다
            </h3>
            <p className="text-sm text-muted-foreground">
              코드 품질, 구조, 베스트 프랙티스를 검토하고 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-xl">!</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">
              피드백 생성에 실패했습니다
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={onReset} variant="outline">
            처음으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!feedback) return null

  const strengths = (feedback.strengths || []) as FeedbackItem[]
  const improvements = (feedback.improvements || []) as ImprovementItem[]
  const codeQuality = feedback.code_quality || {
    readability: 0,
    maintainability: 0,
    correctness: 0,
    best_practices: 0,
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">코드 리뷰 점수</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-foreground tracking-tight">
                  {feedback.overall_score}
                </span>
                <span className="text-lg text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded bg-foreground text-background text-sm font-medium">
              {feedback.grade}
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{feedback.summary}</p>
        </CardContent>
      </Card>

      {/* Code Quality Metrics */}
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-5">
            코드 품질 지표
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "가독성", value: codeQuality.readability },
              { label: "유지보수성", value: codeQuality.maintainability },
              { label: "정확성", value: codeQuality.correctness },
              { label: "베스트 프랙티스", value: codeQuality.best_practices },
            ].map((metric) => (
              <div key={metric.label} className="p-4 rounded-md bg-secondary/50 border border-border/40">
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-500"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8 text-right">
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="border-border/60 shadow-subtle">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-5">
              잘한 점
            </h3>
            <div className="space-y-4">
              {strengths.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md bg-secondary/30 border border-border/40"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    {item.file && (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.file}
                      </code>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <Card className="border-border/60 shadow-subtle">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-5">
              개선 포인트
            </h3>
            <div className="space-y-4">
              {improvements.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md bg-muted/30 border border-border/40"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {getSeverityLabel(item.severity)}
                    </span>
                    {item.file && (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.file}
                      </code>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {item.detail}
                  </p>
                  {item.suggestion && (
                    <div className="rounded-md border border-border/40 overflow-hidden">
                      <div className="px-3 py-1.5 bg-muted/50 border-b border-border/40">
                        <span className="text-xs font-medium text-muted-foreground">제안</span>
                      </div>
                      <p className="p-3 text-sm text-foreground">{item.suggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {feedback.next_steps && feedback.next_steps.length > 0 && (
        <Card className="border-border/60 shadow-subtle">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-5">
              다음 학습 추천
            </h3>
            <ol className="space-y-3">
              {feedback.next_steps.map((item, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed pt-0.5">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={onReset}
        variant="outline"
        className="w-full h-12 text-base font-medium"
      >
        새로운 강의로 실습하기
      </Button>
    </div>
  )
}
