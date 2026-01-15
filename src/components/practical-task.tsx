"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Task, TaskStep } from "@/types"

interface PracticalTaskProps {
  task: Task
  onTaskUpdate: (task: Task) => void
  onStart: () => void
}

const difficultyLabels: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
}

export function PracticalTask({ task, onTaskUpdate, onStart }: PracticalTaskProps) {
  const [isCreatingRepo, setIsCreatingRepo] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)

  const handleCreateRepo = async () => {
    setIsCreatingRepo(true)
    setRepoError(null)

    try {
      const response = await fetch("/api/tasks/create-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "레포지토리 생성에 실패했습니다.")
      }

      onTaskUpdate({ ...task, github_repo_url: data.repo_url })
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : "레포지토리 생성 중 오류가 발생했습니다.")
    } finally {
      setIsCreatingRepo(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div className="text-center pb-6 border-b border-border/40">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              AI 생성 코딩 과제
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-4">
              {task.title}
            </h2>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>{task.estimated_time}</span>
              <span className="text-border">|</span>
              <span>{difficultyLabels[task.difficulty] || task.difficulty}</span>
              {task.tech_stack?.map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* GitHub Repository */}
          <div className="p-5 rounded-md bg-secondary/50 border border-border/40">
            <p className="text-sm font-medium text-foreground mb-3">실습 저장소</p>
            {task.github_repo_url ? (
              <a
                href={task.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
              >
                {task.github_repo_url.replace("https://github.com/", "")}
              </a>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  GitHub 저장소를 생성하여 실습을 시작하세요.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateRepo}
                  disabled={isCreatingRepo}
                  className="h-9"
                >
                  {isCreatingRepo ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      생성 중...
                    </span>
                  ) : (
                    "GitHub 저장소 생성"
                  )}
                </Button>
                {repoError && (
                  <p className="text-sm text-destructive">{repoError}</p>
                )}
              </div>
            )}
          </div>

          {/* Why This Task */}
          <section>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-3">
              왜 이 과제인가요?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {task.reason}
            </p>
          </section>

          {/* Task Description */}
          <section>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-3">
              과제 설명
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          </section>

          {/* Step by Step Guide */}
          {task.steps && task.steps.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
                단계별 가이드
              </h3>
              <ol className="space-y-4">
                {(task.steps as TaskStep[]).map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center">
                      {step.order || index + 1}
                    </span>
                    <div className="flex-1 pt-0.5">
                      {step.title && (
                        <span className="font-medium text-foreground">{step.title}: </span>
                      )}
                      <span className="text-muted-foreground leading-relaxed">
                        {step.content}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Success Criteria */}
          {task.success_criteria && task.success_criteria.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
                코드 리뷰 기준
              </h3>
              <ul className="space-y-2">
                {task.success_criteria.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={onStart}
        className="w-full h-12 text-base font-medium"
      >
        코드 제출하러 가기
      </Button>
    </div>
  )
}
