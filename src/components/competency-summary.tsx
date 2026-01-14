"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, ArrowRight, Code2, Loader2, AlertCircle } from "lucide-react"
import type { LectureWithCompetencies, Task } from "@/types"

interface CompetencySummaryProps {
  lecture: LectureWithCompetencies
  onTaskGenerated: (task: Task) => void
}

export function CompetencySummary({ lecture, onTaskGenerated }: CompetencySummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateTask = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lecture_id: lecture.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "과제 생성에 실패했습니다.")
      }

      onTaskGenerated(data.task)
    } catch (err) {
      setError(err instanceof Error ? err.message : "과제 생성 중 오류가 발생했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Lecture Info Card */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {lecture.thumbnail_url ? (
              <img
                src={lecture.thumbnail_url}
                alt={lecture.title}
                className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2">
                분석 완료
              </Badge>
              <h2 className="text-lg font-semibold text-foreground mb-1">{lecture.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span>YouTube</span>
                {lecture.language && (
                  <span className="flex items-center gap-1">
                    <Code2 className="w-4 h-4" />
                    {lecture.language}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Competencies */}
      <Card className="shadow-sm border-primary/20 bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">핵심 개발 역량</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            이 강의를 통해 습득할 수 있는 핵심 개발 역량입니다
          </p>
          <div className="space-y-4">
            {lecture.competencies.map((competency, index) => (
              <div
                key={competency.id}
                className="flex gap-3 p-3 rounded-lg bg-background/60 border border-border/50"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-foreground text-sm">{competency.name}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{competency.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={handleGenerateTask}
        disabled={isGenerating}
        className="w-full h-11 text-base font-medium gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            과제 생성 중...
          </>
        ) : (
          <>
            코딩 실습 과제 생성하기
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {isGenerating && (
        <p className="text-center text-sm text-muted-foreground">
          AI가 역량에 맞는 실습 과제를 설계하고 있습니다...
        </p>
      )}
    </div>
  )
}
