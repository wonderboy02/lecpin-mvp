"use client"

import Link from "next/link"

/**
 * 대시보드 목업 (디자인 시스템 적용)
 *
 * 주요 요소:
 * - Header
 * - 제목 + 새 강의 시작 버튼
 * - Tabs (진행 중 / 완료 / 전체)
 * - 과제 카드 리스트 (썸네일 + 제목 + 상태 + 날짜)
 * - Footer
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockTasks = [
  {
    id: "1",
    title: "React Hooks 완벽 가이드",
    taskTitle: "Custom Hook으로 폼 상태 관리하기",
    status: "in_progress",
    step: "실습 과제",
    createdAt: "2025.01.10",
    updatedAt: "2025.01.15",
  },
  {
    id: "2",
    title: "TypeScript 기초부터 실전까지",
    taskTitle: "제네릭을 활용한 API 클라이언트 구현",
    status: "in_progress",
    step: "결과 제출",
    createdAt: "2025.01.08",
    updatedAt: "2025.01.14",
  },
  {
    id: "3",
    title: "Node.js 백엔드 구축하기",
    taskTitle: "Express 미들웨어 체인 구현",
    status: "completed",
    step: "완료",
    createdAt: "2025.01.01",
    updatedAt: "2025.01.05",
  },
]

export default function DashboardMockup() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/design-system" className="font-serif text-xl font-semibold tracking-tight">
            LECPIN
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/design-system/dashboard" className="text-sm text-foreground font-medium">
              내 학습
            </Link>
            <div className="w-8 h-8 rounded-full bg-muted" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">
                내 학습
              </h1>
              <p className="text-muted-foreground">
                진행 중인 실습 과제를 관리하세요
              </p>
            </div>
            <Button>
              새 강의 시작
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                  진행 중
                </p>
                <p className="font-serif text-3xl font-semibold">2</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                  완료
                </p>
                <p className="font-serif text-3xl font-semibold">5</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                  총 학습 시간
                </p>
                <p className="font-serif text-3xl font-semibold">12h</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="in_progress">
            <TabsList className="mb-6 bg-transparent border-b border-border rounded-none w-full justify-start gap-6 h-auto p-0">
              <TabsTrigger
                value="in_progress"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
              >
                진행 중
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
              >
                완료
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
              >
                전체
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in_progress" className="mt-0">
              <div className="space-y-4">
                {mockTasks.filter(t => t.status === 'in_progress').map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              <div className="space-y-4">
                {mockTasks.filter(t => t.status === 'completed').map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              <div className="space-y-4">
                {mockTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Empty State (hidden by default) */}
          <div className="hidden">
            <Card className="border-border/60">
              <CardContent className="py-16 text-center">
                <div className="aspect-video max-w-xs mx-auto bg-muted rounded-sm mb-6 relative">
                  {/*
                    권장 이미지: 빈 상태 표현
                    - 깔끔한 빈 노트북 데스크
                    - 시작을 기다리는 느낌
                    - 미니멀하고 깔끔한 구도

                    검색 키워드: "empty desk minimal", "clean workspace ready"
                  */}
                </div>
                <p className="text-muted-foreground mb-6">
                  아직 진행 중인 과제가 없습니다
                </p>
                <Button variant="outline">
                  새 강의로 시작하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-serif text-lg font-semibold">LECPIN</p>
            <p className="text-sm text-muted-foreground">
              2025 LECPIN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TaskCard({ task }: { task: typeof mockTasks[0] }) {
  return (
    <a href={`/design-system/dashboard/${task.id}`}>
      <Card className="border-border/60 hover:border-foreground/20 transition-colors cursor-pointer group">
        <CardContent className="p-0">
          <div className="flex">
            {/* Thumbnail */}
            <div className="w-40 h-32 bg-muted shrink-0 relative">
              {/*
                권장 이미지: 강의 관련 썸네일
                - 해당 기술 스택을 암시하는 이미지
                - 코드 에디터, 터미널 등
                - 작은 사이즈에서도 알아볼 수 있는 단순한 구도

                검색 키워드: "code editor thumbnail", "programming screen minimal"
              */}
              <div className="absolute bottom-2 left-2 text-xs text-muted-foreground/50">
                Thumbnail
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-accent transition-colors mb-1">
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    과제: {task.taskTitle}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>시작: {task.createdAt}</span>
                    <span>최근: {task.updatedAt}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`
                  px-3 py-1 text-xs font-medium rounded-sm
                  ${task.status === 'completed'
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-foreground'
                  }
                `}>
                  {task.step}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
