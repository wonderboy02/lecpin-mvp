"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
      {/* Lecture Info */}
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {lecture.thumbnail_url ? (
              <img
                src={lecture.thumbnail_url}
                alt={lecture.title}
                className="w-28 h-20 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-28 h-20 rounded bg-muted flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                분석 완료
              </p>
              <h2 className="text-lg font-semibold text-foreground leading-tight mb-2">
                {lecture.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>YouTube</span>
                {lecture.language && (
                  <>
                    <span className="text-border">|</span>
                    <span>{lecture.language}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Competencies */}
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              핵심 개발 역량
            </h3>
            <p className="text-sm text-muted-foreground">
              이 강의를 통해 습득할 수 있는 역량입니다
            </p>
          </div>

          <div className="space-y-4">
            {lecture.competencies.map((competency, index) => (
              <div
                key={competency.id}
                className="flex gap-4 p-4 rounded-md bg-secondary/50 border border-border/40"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">
                    {competency.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {competency.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
          {error}
        </div>
      )}

      {/* Generate Task Button */}
      <Button
        onClick={handleGenerateTask}
        disabled={isGenerating}
        className="w-full h-12 text-base font-medium"
      >
        {isGenerating ? (
          <span className="flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            과제 생성 중...
          </span>
        ) : (
          "코딩 실습 과제 생성하기"
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
