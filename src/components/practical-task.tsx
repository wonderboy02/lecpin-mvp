"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Lightbulb,
  ListChecks,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Github,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
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

      // 과제 정보 업데이트
      onTaskUpdate({ ...task, github_repo_url: data.repo_url })
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : "레포지토리 생성 중 오류가 발생했습니다.")
    } finally {
      setIsCreatingRepo(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-primary/20 bg-secondary/30">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-0">
              AI 생성 코딩 과제
            </Badge>
          </div>

          {/* Task Title & Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold text-foreground">코딩 미션</h3>
            </div>
            <p className="text-lg font-medium text-foreground pl-7">{task.title}</p>
            <div className="flex gap-2 pl-7 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {task.estimated_time}
              </Badge>
              <Badge variant="outline">{difficultyLabels[task.difficulty] || task.difficulty}</Badge>
              {task.tech_stack?.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  <Code2 className="w-3 h-3" />
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* GitHub Repo */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Github className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">실습 저장소</span>
            </div>

            {task.github_repo_url ? (
              <div className="flex items-center gap-2">
                <a
                  href={task.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {task.github_repo_url.replace("https://github.com/", "")}
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  GitHub 저장소를 생성하여 실습을 시작하세요.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateRepo}
                  disabled={isCreatingRepo}
                  className="gap-2"
                >
                  {isCreatingRepo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      GitHub 저장소 생성
                    </>
                  )}
                </Button>
                {repoError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {repoError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Why this matters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-semibold text-foreground">왜 이 과제인가요?</h3>
            </div>
            <p className="text-muted-foreground pl-7 leading-relaxed">{task.reason}</p>
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold text-foreground">과제 설명</h3>
            </div>
            <p className="text-muted-foreground pl-7 leading-relaxed">{task.description}</p>
          </div>

          {/* Step-by-step guide */}
          {task.steps && task.steps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <ListChecks className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">단계별 가이드</h3>
              </div>
              <ol className="space-y-3 pl-7">
                {(task.steps as TaskStep[]).map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                      {step.order || index + 1}
                    </span>
                    <div>
                      {step.title && (
                        <span className="font-medium text-foreground">{step.title}: </span>
                      )}
                      <span className="text-muted-foreground leading-relaxed">{step.content}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Success Criteria */}
          {task.success_criteria && task.success_criteria.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">코드 리뷰 기준</h3>
              </div>
              <ul className="space-y-2 pl-7">
                {task.success_criteria.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={onStart} className="w-full h-11 text-base font-medium gap-2">
        코드 제출하러 가기
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
