"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { MOCK_USER_TASK, MOCK_STATS } from "../_data/mock-data"
import type { TaskStep, FeedbackItem, ImprovementItem } from "@/types"

export function OnboardingDashboard() {
  const { lecture, task, feedback } = MOCK_USER_TASK
  const competencies = lecture.competencies || []
  const strengths = (feedback?.strengths || []) as FeedbackItem[]
  const improvements = (feedback?.improvements || []) as ImprovementItem[]
  const codeQuality = feedback?.code_quality || {
    readability: 0,
    maintainability: 0,
    correctness: 0,
    best_practices: 0,
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical": return "심각"
      case "major": return "중요"
      case "minor": return "권장"
      case "suggestion": return "제안"
      default: return ""
    }
  }

  const difficultyLabels: Record<string, string> = {
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">
          내 학습
        </h1>
        <p className="text-muted-foreground">
          새 강의를 입력하거나 진행 중인 실습 과제를 관리하세요
        </p>
      </div>

      {/* Lecture Input Section */}
      <div id="onboarding-step-input" className="mb-12">
        <Card className="border-border/60">
          <CardContent className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
                강의 분석 시작하기
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고
                맞춤형 실습 과제를 생성합니다
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="youtube-url" className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  강의 URL
                </Label>
                <Input
                  id="youtube-url"
                  type="url"
                  value={lecture.youtube_url}
                  readOnly
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  자막이 있는 YouTube 강의 영상을 지원합니다
                </p>
              </div>

              <Button className="w-full h-12 text-base font-medium" disabled>
                강의 분석하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div id="onboarding-step-stats" className="grid grid-cols-3 gap-4 mb-10">
        <Card className="border-border/60">
          <CardContent className="p-6">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
              진행 중
            </p>
            <p className="font-serif text-3xl font-semibold">
              {MOCK_STATS.inProgress}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
              완료
            </p>
            <p className="font-serif text-3xl font-semibold">
              {MOCK_STATS.completed}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
              전체
            </p>
            <p className="font-serif text-3xl font-semibold">
              {MOCK_STATS.total}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value="in_progress">
        <TabsList className="mb-6 bg-transparent border-b border-border rounded-none w-full justify-start gap-6 h-auto p-0">
          <TabsTrigger
            value="in_progress"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 data-[state=active]:shadow-none"
          >
            진행 중
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 data-[state=active]:shadow-none"
          >
            완료
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 data-[state=active]:shadow-none"
          >
            전체
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress" className="mt-0">
          {/* Expanded Task Card */}
          <div className="space-y-6">
            {/* Task Card Header */}
            <Card id="onboarding-step-task" className="border-border/60 shadow-subtle">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="w-40 h-32 bg-muted shrink-0 relative hidden sm:block border border-border/40">
                    {lecture.thumbnail_url ? (
                      <Image
                        src={lecture.thumbnail_url}
                        alt={lecture.title}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50">
                        Thumbnail
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">
                          {lecture.title}
                        </h3>
                        {task && (
                          <p className="text-sm text-muted-foreground mb-3">
                            과제: {task.title}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>시작: {new Date(MOCK_USER_TASK.created_at).toLocaleDateString('ko-KR')}</span>
                          <span>최근: {new Date(MOCK_USER_TASK.updated_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className="px-3 py-1 text-xs font-medium rounded-sm bg-muted text-foreground">
                        피드백
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competencies Section */}
            <Card id="onboarding-step-competencies" className="border-border/60 shadow-subtle">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    핵심 개발 역량
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    이 강의를 통해 습득할 수 있는 역량입니다
                  </p>
                </div>

                <div className="space-y-4">
                  {competencies.map((competency, index) => (
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

            {/* Task Details */}
            {task && (
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
                </CardContent>
              </Card>
            )}

            {/* Feedback Section */}
            {feedback && (
              <div id="onboarding-step-feedback" className="space-y-6">
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
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-5">
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
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-5">
                        잘한 점
                      </h3>
                      <div className="space-y-4">
                        {strengths.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-md bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
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
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-5">
                        개선 포인트
                      </h3>
                      <div className="space-y-4">
                        {improvements.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
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
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
