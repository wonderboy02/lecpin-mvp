"use client"

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
} from "lucide-react"

interface AIFeedbackProps {
  onReset: () => void
}

export function AIFeedback({ onReset }: AIFeedbackProps) {
  const feedback = {
    overallScore: 82,
    grade: "Good",
    summary:
      "전반적으로 커스텀 훅의 개념을 잘 이해하고 적용했습니다. 몇 가지 개선 포인트를 반영하면 더 견고한 코드가 될 것입니다.",
    codeQuality: {
      readability: 85,
      maintainability: 80,
      performance: 78,
      typeScript: 82,
    },
    strengths: [
      {
        title: "커스텀 훅 분리가 잘 되어 있음",
        detail:
          "useTodos, useLocalStorage, useFilter 훅이 단일 책임 원칙을 잘 따르고 있습니다. 각 훅이 하나의 관심사만 다루고 있어 재사용성이 높습니다.",
        file: "hooks/useTodos.ts",
      },
      {
        title: "TypeScript 타입 정의가 명확함",
        detail:
          "Todo 인터페이스와 훅의 반환 타입이 명시적으로 정의되어 있어 타입 안정성이 높습니다. 제네릭을 활용한 useLocalStorage 구현도 좋습니다.",
        file: "types/todo.ts",
      },
      {
        title: "useCallback 의존성 배열 관리",
        detail:
          "핸들러 함수들의 의존성 배열이 올바르게 설정되어 있습니다. 불필요한 리렌더링을 효과적으로 방지하고 있습니다.",
        file: "hooks/useTodos.ts",
      },
    ],
    improvements: [
      {
        title: "useMemo 적용 범위 개선 필요",
        detail:
          "filteredTodos 계산에 useMemo가 적용되어 있지만, 의존성 배열에 todos 전체가 들어가 있어 최적화 효과가 제한적입니다. todos.length와 filter 값만 의존성에 넣는 것을 고려해보세요.",
        file: "hooks/useFilter.ts",
        severity: "medium",
        suggestion: `const filteredTodos = useMemo(() => {
  return todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });
}, [todos, filter]);`,
      },
      {
        title: "에러 핸들링 부재",
        detail:
          "useLocalStorage에서 JSON.parse 실패 시 예외 처리가 없습니다. try-catch로 감싸고 초기값을 반환하도록 수정하세요.",
        file: "hooks/useLocalStorage.ts",
        severity: "high",
        suggestion: `try {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : initialValue;
} catch (error) {
  console.error('Failed to parse localStorage:', error);
  return initialValue;
}`,
      },
      {
        title: "매직 넘버 상수화 권장",
        detail:
          "필터 옵션 문자열('all', 'completed', 'active')이 하드코딩되어 있습니다. 상수나 enum으로 추출하면 유지보수성이 향상됩니다.",
        file: "hooks/useFilter.ts",
        severity: "low",
      },
    ],
    nextSteps: [
      "React Query나 SWR을 활용한 서버 상태 관리 학습",
      "Context API와 커스텀 훅 조합으로 전역 상태 관리 패턴 익히기",
      "테스트 코드 작성으로 커스텀 훅의 동작 검증하기",
    ],
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-500/10"
      case "medium":
        return "text-amber-500 bg-amber-500/10"
      case "low":
        return "text-blue-500 bg-blue-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high":
        return "중요"
      case "medium":
        return "권장"
      case "low":
        return "제안"
      default:
        return ""
    }
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
                  <span className="text-4xl font-bold text-foreground">{feedback.overallScore}</span>
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
                    style={{ width: `${feedback.codeQuality.readability}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{feedback.codeQuality.readability}</span>
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
                    style={{ width: `${feedback.codeQuality.maintainability}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{feedback.codeQuality.maintainability}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">성능</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${feedback.codeQuality.performance}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{feedback.codeQuality.performance}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${feedback.codeQuality.typeScript}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{feedback.codeQuality.typeScript}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">잘한 점</h3>
          </div>
          <div className="space-y-4">
            {feedback.strengths.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.file}</code>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">개선 포인트</h3>
          </div>
          <div className="space-y-4">
            {feedback.improvements.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <Badge variant="outline" className={`text-xs ${getSeverityColor(item.severity)}`}>
                        {getSeverityLabel(item.severity)}
                      </Badge>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.file}</code>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.detail}</p>
                    {item.suggestion && (
                      <div className="bg-background rounded-lg border border-border overflow-hidden">
                        <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                          <span className="text-xs font-medium text-muted-foreground">제안 코드</span>
                        </div>
                        <pre className="p-3 text-xs overflow-x-auto">
                          <code className="text-foreground">{item.suggestion}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">다음 학습 추천</h3>
          </div>
          <ul className="space-y-2">
            {feedback.nextSteps.map((item, index) => (
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

      <Button onClick={onReset} variant="outline" className="w-full h-11 text-base font-medium gap-2 bg-transparent">
        <RotateCcw className="w-4 h-4" />
        새로운 강의로 실습하기
      </Button>
    </div>
  )
}
