"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Award,
  ThumbsUp,
  AlertTriangle,
  TrendingUp,
  Star,
  RotateCcw,
  CheckCircle2,
  Code2,
  Zap,
  Shield,
  FileCode,
  Bug,
  Loader2,
  AlertCircle,
} from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(!feedback)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (feedback) return

    const generateFeedback = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/feedback/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submission_id: submission.id }),
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
  }, [submission.id, feedback, onFeedbackGenerated])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-500/10"
      case "major":
        return "text-red-500 bg-red-500/10"
      case "minor":
        return "text-amber-500 bg-amber-500/10"
      case "suggestion":
        return "text-blue-500 bg-blue-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

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
      <Card className="shadow-sm border-border">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">AI가 코드를 분석하고 있습니다</h3>
            <p className="text-sm text-muted-foreground">
              코드 품질, 구조, 베스트 프랙티스를 검토하고 있습니다.
              <br />
              잠시만 기다려주세요...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm border-border">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">피드백 생성에 실패했습니다</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
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
      {/* Overall Score Card */}
      <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">코드 리뷰 점수</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">{feedback.overall_score}</span>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>
            <Badge className="px-4 py-2 text-base bg-primary text-primary-foreground">
              <Star className="w-4 h-4 mr-1" />
              {feedback.grade}
            </Badge>
          </div>
          <p className="text-muted-foreground">{feedback.summary}</p>
        </CardContent>
      </Card>

      {/* Code Quality Metrics */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">코드 품질 지표</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">가독성</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${codeQuality.readability}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{codeQuality.readability}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">유지보수성</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${codeQuality.maintainability}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{codeQuality.maintainability}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">정확성</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${codeQuality.correctness}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{codeQuality.correctness}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">베스트 프랙티스</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${codeQuality.best_practices}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{codeQuality.best_practices}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">잘한 점</h3>
            </div>
            <div className="space-y-4">
              {strengths.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        {item.file && (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {item.file}
                          </code>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">개선 포인트</h3>
            </div>
            <div className="space-y-4">
              {improvements.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(item.severity)}`}>
                          {getSeverityLabel(item.severity)}
                        </Badge>
                        {item.file && (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {item.file}
                          </code>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.detail}</p>
                      {item.suggestion && (
                        <div className="bg-background rounded-lg border border-border overflow-hidden">
                          <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground">제안</span>
                          </div>
                          <p className="p-3 text-sm text-foreground">{item.suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {feedback.next_steps && feedback.next_steps.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">다음 학습 추천</h3>
            </div>
            <ul className="space-y-2">
              {feedback.next_steps.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button onClick={onReset} variant="outline" className="w-full h-11 text-base font-medium gap-2 bg-transparent">
        <RotateCcw className="w-4 h-4" />
        새로운 강의로 실습하기
      </Button>
    </div>
  )
}
