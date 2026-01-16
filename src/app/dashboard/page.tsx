"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LectureInput } from "@/components/lecture-input"
import type { UserTaskWithRelations, Step, LectureWithCompetencies } from "@/types"

const stepLabels: Record<Step, string> = {
  input: '강의 입력',
  summary: '역량 분석',
  task: '실습 과제',
  submit: '결과 제출',
  feedback: '피드백',
  completed: '완료'
}

export default function DashboardPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useUser()
  const [allTasks, setAllTasks] = useState<UserTaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'in_progress' | 'completed' | 'all'>('in_progress')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [authLoading, isLoggedIn, router])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/user-tasks?status=all`)
      const data = await res.json()
      if (data.tasks) {
        setAllTasks(data.tasks)
      }
    } catch (error) {
      console.error('Fetch tasks error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks()
    }
  }, [isLoggedIn, fetchTasks])

  // 필터링된 과제 목록
  const tasks = allTasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'completed') return task.status === 'completed'
    return task.status === 'in_progress'
  })

  // 상태별 개수
  const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length
  const completedCount = allTasks.filter(t => t.status === 'completed').length
  const totalCount = allTasks.length

  const handleAnalyzeComplete = async (lectureData: LectureWithCompetencies) => {
    try {
      setIsCreating(true)

      const res = await fetch('/api/user-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecture_id: lectureData.id }),
      })
      const data = await res.json()

      if (data.userTask) {
        router.push(`/dashboard/${data.userTask.id}`)
      } else {
        console.error('Failed to create user task:', data.error)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Create user task error:', error)
      setIsCreating(false)
    }
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/dashboard/${taskId}`)
  }

  const getStatusBadge = (status: string, step: Step) => {
    if (status === 'completed') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-sm bg-foreground text-background">
          완료
        </span>
      )
    }
    if (status === 'abandoned') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-sm bg-muted text-muted-foreground">
          포기
        </span>
      )
    }
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-sm bg-muted text-foreground">
        {stepLabels[step]}
      </span>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
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
          <div className="mb-12">
            {isCreating ? (
              <Card className="border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    과제 세션을 생성하는 중...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <LectureInput onAnalyzeComplete={handleAnalyzeComplete} />
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                  진행 중
                </p>
                <p className="font-serif text-3xl font-semibold">
                  {inProgressCount}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                  완료
                </p>
                <p className="font-serif text-3xl font-semibold">
                  {completedCount}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                  전체
                </p>
                <p className="font-serif text-3xl font-semibold">
                  {totalCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
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

            <TabsContent value={filter} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <Card className="border-border/60">
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground">
                      {filter === 'in_progress' ? '진행 중인 과제가 없습니다.' : '과제가 없습니다.'}<br />
                      상단에서 새 강의를 입력해보세요.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-border/60 hover:border-foreground/20 transition-colors cursor-pointer group"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Thumbnail */}
                          <div className="w-40 h-32 bg-muted shrink-0 relative hidden sm:block">
                            {/*
                              권장 이미지: 강의 썸네일
                              - YouTube 썸네일이 있으면 사용
                              - 없으면 기본 placeholder
                            */}
                            {task.lecture?.thumbnail_url ? (
                              <img
                                src={task.lecture.thumbnail_url}
                                alt=""
                                className="w-full h-full object-cover"
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
                                <h3 className="font-medium group-hover:text-accent transition-colors mb-1">
                                  {task.lecture?.title || '제목 없음'}
                                </h3>
                                {task.task && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    과제: {task.task.title}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>시작: {new Date(task.created_at).toLocaleDateString('ko-KR')}</span>
                                  <span>최근: {new Date(task.updated_at).toLocaleDateString('ko-KR')}</span>
                                </div>
                              </div>

                              {/* Status Badge */}
                              {getStatusBadge(task.status, task.current_step)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
