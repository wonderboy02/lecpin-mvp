"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Target, ArrowRight, Code2 } from "lucide-react"

interface CompetencySummaryProps {
  onNext: () => void
}

export function CompetencySummary({ onNext }: CompetencySummaryProps) {
  const lectureInfo = {
    title: "React Hook 완벽 가이드: useState부터 커스텀 훅까지",
    duration: "1시간 20분",
    platform: "YouTube",
    language: "TypeScript / React",
  }

  const competencies = [
    {
      name: "React 상태 관리",
      description: "useState, useReducer를 활용한 컴포넌트 상태 관리 및 상태 설계 패턴 이해",
    },
    {
      name: "Side Effect 처리",
      description: "useEffect를 활용한 데이터 페칭, 구독, DOM 조작 등 부수 효과 관리",
    },
    {
      name: "성능 최적화",
      description: "useMemo, useCallback을 활용한 불필요한 리렌더링 방지 및 성능 튜닝",
    },
    {
      name: "커스텀 훅 설계",
      description: "재사용 가능한 로직을 커스텀 훅으로 추상화하는 설계 능력",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Lecture Info Card */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2">
                분석 완료
              </Badge>
              <h2 className="text-lg font-semibold text-foreground mb-1">{lectureInfo.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lectureInfo.duration}
                </span>
                <span>{lectureInfo.platform}</span>
                <span className="flex items-center gap-1">
                  <Code2 className="w-4 h-4" />
                  {lectureInfo.language}
                </span>
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
          <p className="text-sm text-muted-foreground mb-4">이 강의를 통해 습득할 수 있는 핵심 개발 역량입니다</p>
          <div className="space-y-4">
            {competencies.map((competency, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-background/60 border border-border/50">
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

      <Button onClick={onNext} className="w-full h-11 text-base font-medium gap-2">
        코딩 실습 과제 생성하기
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
