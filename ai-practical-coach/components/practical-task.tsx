"use client"

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
  FileCode,
  GitBranch,
} from "lucide-react"

interface PracticalTaskProps {
  onStart: () => void
}

export function PracticalTask({ onStart }: PracticalTaskProps) {
  const task = {
    title: "커스텀 훅을 활용한 Todo 앱 리팩토링",
    estimatedTime: "2-3시간",
    difficulty: "중급",
    techStack: ["React", "TypeScript", "Vite"],
    reason:
      "이 과제는 강의에서 배운 useState, useEffect, 그리고 커스텀 훅 설계 역량을 실제 프로젝트에 적용해볼 수 있습니다. 기존 Todo 앱의 로직을 커스텀 훅으로 분리하면서 재사용 가능한 코드 설계 능력을 기를 수 있습니다.",
    steps: [
      "제공된 기본 Todo 앱 코드를 로컬에서 실행하고 구조를 파악합니다",
      "useState로 관리되는 todos 상태와 관련 로직을 useTodos 커스텀 훅으로 분리합니다",
      "localStorage 연동 로직을 useLocalStorage 커스텀 훅으로 추상화합니다",
      "필터링 기능(전체/완료/미완료)을 useFilter 커스텀 훅으로 구현합니다",
      "useMemo를 활용하여 필터링된 todo 목록의 불필요한 재계산을 방지합니다",
      "useCallback을 활용하여 자식 컴포넌트에 전달하는 핸들러 함수를 최적화합니다",
    ],
    successCriteria: [
      "useTodos, useLocalStorage, useFilter 3개의 커스텀 훅이 구현되어 있음",
      "메인 컴포넌트에서 커스텀 훅을 import하여 사용하고 있음",
      "useMemo, useCallback이 적절한 의존성 배열과 함께 사용됨",
      "TypeScript 타입이 올바르게 정의되어 있고 any 타입이 없음",
      "코드가 에러 없이 정상 동작함",
    ],
    boilerplateUrl: "https://github.com/example/todo-hooks-starter",
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
                {task.estimatedTime}
              </Badge>
              <Badge variant="outline">{task.difficulty}</Badge>
              {task.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  <Code2 className="w-3 h-3" />
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Starter Code */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">스타터 코드</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-muted-foreground" />
              <code className="text-sm text-muted-foreground bg-background/60 px-2 py-1 rounded">
                git clone {task.boilerplateUrl}
              </code>
            </div>
          </div>

          {/* Why this matters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-semibold text-foreground">왜 이 과제인가요?</h3>
            </div>
            <p className="text-muted-foreground pl-7 leading-relaxed">{task.reason}</p>
          </div>

          {/* Step-by-step guide */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ListChecks className="w-5 h-5" />
              <h3 className="font-semibold text-foreground">단계별 가이드</h3>
            </div>
            <ol className="space-y-3 pl-7">
              {task.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Success Criteria */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-foreground">코드 리뷰 기준</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {task.successCriteria.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onStart} className="w-full h-11 text-base font-medium gap-2">
        코딩 실습 시작하기
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
