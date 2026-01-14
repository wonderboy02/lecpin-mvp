"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserTaskWithRelations, Step } from "@/types"

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
  const [tasks, setTasks] = useState<UserTaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'in_progress' | 'completed' | 'all'>('in_progress')

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [authLoading, isLoggedIn, router])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/user-tasks?status=${filter}`)
      const data = await res.json()
      if (data.tasks) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Fetch tasks error:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks()
    }
  }, [isLoggedIn, fetchTasks])

  const handleNewTask = () => {
    router.push('/')
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/dashboard/${taskId}`)
  }

  const getStatusBadge = (status: string, step: Step) => {
    if (status === 'completed') {
      return <Badge variant="default">완료</Badge>
    }
    if (status === 'abandoned') {
      return <Badge variant="secondary">포기</Badge>
    }
    return <Badge variant="outline">{stepLabels[step]}</Badge>
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
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">내 학습</h1>
            <p className="text-muted-foreground mt-1">진행 중인 실습 과제를 관리하세요</p>
          </div>
          <Button onClick={handleNewTask}>
            새 강의 시작
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="mb-6">
            <TabsTrigger value="in_progress">진행 중</TabsTrigger>
            <TabsTrigger value="completed">완료</TabsTrigger>
            <TabsTrigger value="all">전체</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {filter === 'in_progress' ? '진행 중인 과제가 없습니다.' : '과제가 없습니다.'}
                  </p>
                  <Button variant="outline" onClick={handleNewTask}>
                    새 강의로 시작하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:border-foreground/20 transition-colors"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {task.lecture?.title || '제목 없음'}
                          </CardTitle>
                          {task.task && (
                            <CardDescription className="mt-1">
                              과제: {task.task.title}
                            </CardDescription>
                          )}
                        </div>
                        {getStatusBadge(task.status, task.current_step)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          시작: {new Date(task.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <span>
                          최근: {new Date(task.updated_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
