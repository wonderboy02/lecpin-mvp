# Task A: 대시보드 + DB 상태 저장

## 담당자 정보
- **담당:** A
- **브랜치:** `feature/dashboard`
- **예상 기간:** 2주
- **의존성:** 없음 (선행 작업)

---

## 1. 목표

사용자의 과제 진행 상태를 DB에 저장하고, 대시보드를 통해 관리할 수 있도록 구현

### 완료 조건
- [ ] 진행 중인 과제 목록 조회 가능
- [ ] 새로고침해도 진행 상태 유지
- [ ] 과제별 상세 페이지에서 단계별 진행 가능
- [ ] 완료/포기한 과제 구분 표시

---

## 2. DB 마이그레이션

### 2.1 user_tasks 테이블 생성

**파일:** `supabase/migrations/001_create_user_tasks.sql`

```sql
-- 사용자별 과제 진행 상태 테이블
CREATE TABLE user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  feedback_id UUID REFERENCES feedbacks(id) ON DELETE SET NULL,

  -- 현재 진행 단계
  current_step VARCHAR(20) NOT NULL DEFAULT 'input'
    CHECK (current_step IN ('input', 'summary', 'task', 'submit', 'feedback', 'completed')),

  -- 과제 상태
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일 사용자가 같은 강의에 여러 과제 가능 (재시도)
  UNIQUE(user_id, lecture_id, created_at)
);

-- 인덱스
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_status ON user_tasks(status);
CREATE INDEX idx_user_tasks_user_status ON user_tasks(user_id, status);

-- RLS 정책
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON user_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON user_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON user_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON user_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 마이그레이션 실행

```bash
# Supabase CLI 사용 시
supabase db push

# 또는 Supabase Dashboard에서 SQL Editor로 실행
```

---

## 3. 타입 정의

### 3.1 `src/types/index.ts` 추가

```typescript
// user_tasks 테이블 타입
export interface UserTask {
  id: string
  user_id: string
  lecture_id: string
  task_id: string | null
  submission_id: string | null
  feedback_id: string | null
  current_step: Step
  status: 'in_progress' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}

// Relations 포함 타입
export interface UserTaskWithRelations extends UserTask {
  lecture: Lecture
  task?: Task
  submission?: Submission
  feedback?: Feedback
}
```

### 3.2 `src/lib/supabase/database.ts` 업데이트

Supabase에서 타입 재생성:
```bash
supabase gen types typescript --local > src/lib/supabase/database.ts
```

---

## 4. API 구현

### 4.1 GET `/api/user-tasks` - 목록 조회

**파일:** `src/app/api/user-tasks/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'in_progress' | 'completed' | 'all'

    let query = supabase
      .from('user_tasks')
      .select(`
        *,
        lecture:lectures(*),
        task:tasks(*),
        submission:submissions(*),
        feedback:feedbacks(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Fetch user tasks error:', error)
      return NextResponse.json({ error: '과제 목록을 불러오는데 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ tasks: data })

  } catch (error) {
    console.error('User tasks error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

### 4.2 POST `/api/user-tasks` - 새 과제 세션 시작

```typescript
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { lecture_id } = body

    if (!lecture_id) {
      return NextResponse.json({ error: 'lecture_id가 필요합니다.' }, { status: 400 })
    }

    // 강의 존재 확인
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select('id')
      .eq('id', lecture_id)
      .single()

    if (lectureError || !lecture) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 새 user_task 생성
    const { data: userTask, error: insertError } = await supabase
      .from('user_tasks')
      .insert({
        user_id: user.id,
        lecture_id,
        current_step: 'summary', // 강의 분석 완료 후 생성되므로
      })
      .select()
      .single()

    if (insertError) {
      console.error('Create user task error:', insertError)
      return NextResponse.json({ error: '과제 생성에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ userTask })

  } catch (error) {
    console.error('Create user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

### 4.3 PATCH `/api/user-tasks/[id]` - 상태 업데이트

**파일:** `src/app/api/user-tasks/[id]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params {
  params: { id: string }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { current_step, status, task_id, submission_id, feedback_id } = body

    // 본인 과제인지 확인
    const { data: existing, error: findError } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: '과제를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 업데이트할 필드만 포함
    const updateData: Record<string, unknown> = {}
    if (current_step) updateData.current_step = current_step
    if (status) updateData.status = status
    if (task_id) updateData.task_id = task_id
    if (submission_id) updateData.submission_id = submission_id
    if (feedback_id) updateData.feedback_id = feedback_id

    const { data: updated, error: updateError } = await supabase
      .from('user_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update user task error:', updateError)
      return NextResponse.json({ error: '업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ userTask: updated })

  } catch (error) {
    console.error('Update user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = params

    // 삭제 대신 상태를 'abandoned'로 변경 (soft delete)
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({ status: 'abandoned' })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Abandon user task error:', updateError)
      return NextResponse.json({ error: '과제 포기에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Abandon user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

### 4.4 GET `/api/user-tasks/[id]` - 단일 조회

```typescript
export async function GET(request: Request, { params }: Params) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = params

    const { data, error } = await supabase
      .from('user_tasks')
      .select(`
        *,
        lecture:lectures(*,
          competencies(*)
        ),
        task:tasks(*),
        submission:submissions(*),
        feedback:feedbacks(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '과제를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ userTask: data })

  } catch (error) {
    console.error('Get user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

---

## 5. 페이지 구현

### 5.1 대시보드 목록 페이지

**파일:** `src/app/dashboard/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
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
  const { user, isLoggedIn, loading: authLoading } = useUser()
  const [tasks, setTasks] = useState<UserTaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'in_progress' | 'completed' | 'all'>('in_progress')

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [authLoading, isLoggedIn, router])

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks()
    }
  }, [isLoggedIn, filter])

  const fetchTasks = async () => {
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
  }

  const handleNewTask = () => {
    router.push('/')  // 메인 페이지에서 새 강의 입력
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
```

### 5.2 과제 상세 페이지

**파일:** `src/app/dashboard/[id]/page.tsx`

```typescript
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StepNavigation } from "@/components/step-navigation"  // B가 구현
import { CompetencySummary } from "@/components/competency-summary"
import { PracticalTask } from "@/components/practical-task"
import { SubmissionUpload } from "@/components/submission-upload"
import { AIFeedback } from "@/components/ai-feedback"
import type { UserTaskWithRelations, Step, Task, Submission, Feedback } from "@/types"

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isLoggedIn, loading: authLoading } = useUser()

  const [userTask, setUserTask] = useState<UserTaskWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  const userTaskId = params.id as string

  // 데이터 로드
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
      return
    }

    if (isLoggedIn && userTaskId) {
      fetchUserTask()
    }
  }, [authLoading, isLoggedIn, userTaskId])

  const fetchUserTask = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/user-tasks/${userTaskId}`)
      const data = await res.json()
      if (data.userTask) {
        setUserTask(data.userTask)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Fetch user task error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // 단계 업데이트
  const updateStep = useCallback(async (step: Step, additionalData?: Record<string, unknown>) => {
    if (!userTask) return

    try {
      const res = await fetch(`/api/user-tasks/${userTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_step: step, ...additionalData }),
      })
      const data = await res.json()
      if (data.userTask) {
        setUserTask(prev => prev ? { ...prev, ...data.userTask } : null)
      }
    } catch (error) {
      console.error('Update step error:', error)
    }
  }, [userTask, userTaskId])

  // 단계별 핸들러
  const handleTaskGenerated = (task: Task) => {
    setUserTask(prev => prev ? { ...prev, task, task_id: task.id } : null)
    updateStep('task', { task_id: task.id })
  }

  const handleStartTask = () => {
    updateStep('submit')
  }

  const handleSubmissionComplete = (submission: Submission) => {
    setUserTask(prev => prev ? { ...prev, submission, submission_id: submission.id } : null)
    updateStep('feedback', { submission_id: submission.id })
  }

  const handleFeedbackGenerated = (feedback: Feedback) => {
    setUserTask(prev => prev ? { ...prev, feedback, feedback_id: feedback.id } : null)
    updateStep('completed', { feedback_id: feedback.id, status: 'completed' })
  }

  const handleStepClick = (step: Step) => {
    // 완료된 단계만 이동 가능
    const stepOrder: Step[] = ['input', 'summary', 'task', 'submit', 'feedback', 'completed']
    const currentIndex = stepOrder.indexOf(userTask?.current_step || 'input')
    const targetIndex = stepOrder.indexOf(step)

    if (targetIndex <= currentIndex) {
      updateStep(step)
    }
  }

  const handleReset = () => {
    router.push('/dashboard')
  }

  // 로딩 상태
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!userTask) {
    return null
  }

  const { current_step, lecture, task, submission, feedback } = userTask

  // 완료된 단계들 계산
  const stepOrder: Step[] = ['summary', 'task', 'submit', 'feedback']
  const currentIndex = stepOrder.indexOf(current_step)
  const completedSteps = stepOrder.slice(0, currentIndex)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {/* B가 구현할 StepNavigation 컴포넌트 사용 */}
        <StepNavigation
          currentStep={current_step}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* 단계별 컨텐츠 */}
        <div className="animate-fade-in mt-8">
          {current_step === 'summary' && lecture && (
            <CompetencySummary
              lecture={{ ...lecture, competencies: lecture.competencies || [] }}
              onTaskGenerated={handleTaskGenerated}
            />
          )}
          {current_step === 'task' && task && (
            <PracticalTask
              task={task}
              onTaskUpdate={(t) => setUserTask(prev => prev ? { ...prev, task: t } : null)}
              onStart={handleStartTask}
            />
          )}
          {current_step === 'submit' && task && (
            <SubmissionUpload
              task={task}
              onSubmissionComplete={handleSubmissionComplete}
            />
          )}
          {(current_step === 'feedback' || current_step === 'completed') && submission && (
            <AIFeedback
              submission={submission}
              feedback={feedback || null}
              onFeedbackGenerated={handleFeedbackGenerated}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

---

## 6. 기존 코드 수정

### 6.1 메인 페이지 수정 (`src/app/page.tsx`)

강의 분석 완료 시 user_task 생성 후 대시보드로 리다이렉트:

```typescript
// handleAnalyzeComplete 수정
const handleAnalyzeComplete = async (lectureData: LectureWithCompetencies) => {
  // user_task 생성
  const res = await fetch('/api/user-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lecture_id: lectureData.id }),
  })
  const data = await res.json()

  if (data.userTask) {
    // 대시보드 상세 페이지로 이동
    router.push(`/dashboard/${data.userTask.id}`)
  }
}
```

### 6.2 기존 API 수정

과제 생성/제출/피드백 API에서 `user_task` 업데이트 로직 추가 필요
(선택사항: API에서 자동 업데이트 or 클라이언트에서 별도 호출)

---

## 7. 테스트 체크리스트

### 기능 테스트
- [ ] 로그인 후 대시보드 접근 가능
- [ ] 비로그인 시 로그인 페이지로 리다이렉트
- [ ] 과제 목록 조회 (진행중/완료/전체)
- [ ] 과제 카드 클릭 시 상세 페이지 이동
- [ ] 새 강의 시작 시 user_task 생성
- [ ] 단계 진행 시 DB 업데이트
- [ ] 새로고침 후 상태 유지
- [ ] 과제 완료 시 상태 변경

### 엣지 케이스
- [ ] 존재하지 않는 과제 ID 접근 시 처리
- [ ] 다른 사용자의 과제 접근 시도 시 처리
- [ ] 네트워크 오류 시 에러 메시지 표시

---

## 8. 참고 사항

### B 담당자와 협업
- `StepNavigation` 컴포넌트 인터페이스 확정 필요
- props: `currentStep`, `completedSteps`, `onStepClick`

### C 담당자와 협업
- 온보딩 완료 후 대시보드로 리다이렉트 경로 확인
- 가이드 페이지에서 대시보드 링크 추가

---

## 9. 예상 이슈

1. **RLS 정책**: user_id 확인 로직이 제대로 동작하는지 테스트 필요
2. **동시성**: 같은 과제에 여러 탭에서 접근 시 상태 동기화
3. **성능**: 과제 목록이 많아질 경우 페이지네이션 고려

---

## 10. 완료 후 다음 단계

1. B의 StepNavigation 컴포넌트 통합
2. C의 온보딩 플로우와 연결
3. 전체 E2E 테스트
