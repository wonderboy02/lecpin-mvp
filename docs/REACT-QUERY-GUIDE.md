# React Query 적용 가이드

LECPIN 프로젝트에 React Query (TanStack Query)를 적용하기 위한 가이드입니다.

---

## 1. 설치

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## 2. Provider 설정

### `src/providers/query-provider.tsx`

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분간 캐시 유지
            staleTime: 5 * 60 * 1000,
            // 30분간 캐시 보관
            gcTime: 30 * 60 * 1000,
            // 윈도우 포커스 시 자동 refetch
            refetchOnWindowFocus: false,
            // 에러 시 재시도 1회
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### `src/app/layout.tsx` 수정

```tsx
import { QueryProvider } from '@/providers/query-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

## 3. API 함수 분리

### `src/lib/api/user-tasks.ts`

```typescript
import type { UserTaskWithRelations, Step } from '@/types'

const API_BASE = '/api'

// 리스트 조회
export async function fetchUserTasks(
  status: 'in_progress' | 'completed' | 'all' = 'all'
): Promise<UserTaskWithRelations[]> {
  const res = await fetch(`${API_BASE}/user-tasks?status=${status}`)
  if (!res.ok) throw new Error('Failed to fetch user tasks')
  const data = await res.json()
  return data.tasks
}

// 상세 조회
export async function fetchUserTask(id: string): Promise<{
  userTask: UserTaskWithRelations
  submissionHistory: unknown[]
  totalAttempts: number
}> {
  const res = await fetch(`${API_BASE}/user-tasks/${id}`)
  if (!res.ok) throw new Error('Failed to fetch user task')
  return res.json()
}

// 생성
export async function createUserTask(lectureId: string): Promise<{ userTask: UserTaskWithRelations }> {
  const res = await fetch(`${API_BASE}/user-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lecture_id: lectureId }),
  })
  if (!res.ok) throw new Error('Failed to create user task')
  return res.json()
}

// 업데이트
export async function updateUserTask(
  id: string,
  data: {
    current_step?: Step
    status?: string
    task_id?: string
    submission_id?: string
    feedback_id?: string
  }
): Promise<{ userTask: UserTaskWithRelations }> {
  const res = await fetch(`${API_BASE}/user-tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update user task')
  return res.json()
}

// 삭제 (soft)
export async function abandonUserTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user-tasks/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to abandon user task')
}
```

---

## 4. Query Keys 정의

### `src/lib/api/query-keys.ts`

```typescript
// 일관된 쿼리 키 관리
export const queryKeys = {
  // User Tasks
  userTasks: {
    all: ['user-tasks'] as const,
    lists: () => [...queryKeys.userTasks.all, 'list'] as const,
    list: (status: string) => [...queryKeys.userTasks.lists(), status] as const,
    details: () => [...queryKeys.userTasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.userTasks.details(), id] as const,
  },

  // Lectures
  lectures: {
    all: ['lectures'] as const,
    detail: (id: string) => [...queryKeys.lectures.all, id] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    detail: (id: string) => [...queryKeys.tasks.all, id] as const,
  },

  // Submissions
  submissions: {
    all: ['submissions'] as const,
    byTask: (taskId: string) => [...queryKeys.submissions.all, 'task', taskId] as const,
  },

  // User
  user: {
    profile: ['user', 'profile'] as const,
  },
}
```

---

## 5. Custom Hooks 작성

### `src/hooks/use-user-tasks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import {
  fetchUserTasks,
  fetchUserTask,
  createUserTask,
  updateUserTask,
  abandonUserTask,
} from '@/lib/api/user-tasks'
import type { Step } from '@/types'

// 리스트 조회
export function useUserTasks(status: 'in_progress' | 'completed' | 'all' = 'all') {
  return useQuery({
    queryKey: queryKeys.userTasks.list(status),
    queryFn: () => fetchUserTasks(status),
  })
}

// 상세 조회
export function useUserTask(id: string) {
  return useQuery({
    queryKey: queryKeys.userTasks.detail(id),
    queryFn: () => fetchUserTask(id),
    enabled: !!id,
  })
}

// 생성
export function useCreateUserTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUserTask,
    onSuccess: () => {
      // 리스트 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.userTasks.lists(),
      })
    },
  })
}

// 업데이트 (step 변경 등)
export function useUpdateUserTask(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      current_step?: Step
      status?: string
      task_id?: string
      submission_id?: string
      feedback_id?: string
    }) => updateUserTask(id, data),
    onSuccess: (result) => {
      // 상세 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.userTasks.detail(id),
        (old: unknown) => old ? { ...old, userTask: result.userTask } : old
      )
      // 리스트도 무효화 (상태가 바뀔 수 있으므로)
      queryClient.invalidateQueries({
        queryKey: queryKeys.userTasks.lists(),
      })
    },
  })
}

// 삭제
export function useAbandonUserTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: abandonUserTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userTasks.lists(),
      })
    },
  })
}
```

---

## 6. 페이지에서 사용

### Before (현재 패턴)

```tsx
// dashboard/page.tsx
export default function DashboardPage() {
  const [tasks, setTasks] = useState<UserTaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'in_progress' | 'completed' | 'all'>('in_progress')

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

  // ... 렌더링
}
```

### After (React Query)

```tsx
// dashboard/page.tsx
export default function DashboardPage() {
  const [filter, setFilter] = useState<'in_progress' | 'completed' | 'all'>('in_progress')

  const { data: tasks = [], isLoading, error } = useUserTasks(filter)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  // ... 렌더링 (loading 상태 관리 불필요)
}
```

---

## 7. 상세 페이지 사용 예시

### Before

```tsx
// dashboard/[id]/page.tsx
export default function TaskDetailPage() {
  const [userTask, setUserTask] = useState<UserTaskWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserTask = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/user-tasks/${userTaskId}`)
      const data = await res.json()
      if (data.userTask) {
        setUserTask(data.userTask)
      }
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [userTaskId, router])

  const updateStep = useCallback(async (step: Step) => {
    await fetch(`/api/user-tasks/${userTaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ current_step: step }),
    })
    // 수동으로 상태 업데이트
    setUserTask(prev => prev ? { ...prev, current_step: step } : null)
  }, [userTaskId])
}
```

### After

```tsx
// dashboard/[id]/page.tsx
export default function TaskDetailPage() {
  const { id } = useParams()

  const { data, isLoading, error } = useUserTask(id as string)
  const updateMutation = useUpdateUserTask(id as string)

  if (isLoading) return <LoadingSpinner />
  if (error || !data) return <NotFound />

  const { userTask, submissionHistory } = data

  const handleStepChange = (step: Step) => {
    updateMutation.mutate({ current_step: step })
  }

  // mutation 상태도 UI에 반영 가능
  // updateMutation.isPending → 저장 중 표시
}
```

---

## 8. Optimistic Updates (선택)

step 변경 시 즉각적인 UI 반응을 원할 때:

```typescript
export function useUpdateUserTask(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => updateUserTask(id, data),

    // 요청 전에 UI 먼저 업데이트
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userTasks.detail(id) })

      const previousData = queryClient.getQueryData(queryKeys.userTasks.detail(id))

      // 낙관적으로 캐시 업데이트
      queryClient.setQueryData(queryKeys.userTasks.detail(id), (old: any) => ({
        ...old,
        userTask: { ...old.userTask, ...newData },
      }))

      return { previousData }
    },

    // 에러 시 롤백
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        queryKeys.userTasks.detail(id),
        context?.previousData
      )
    },

    // 완료 후 서버 데이터로 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userTasks.detail(id) })
    },
  })
}
```

---

## 9. 마이그레이션 순서

1. **패키지 설치** 및 Provider 설정
2. **API 함수 분리** (`src/lib/api/`)
3. **Query Keys 정의** (`src/lib/api/query-keys.ts`)
4. **Custom Hooks 작성** (`src/hooks/use-*.ts`)
5. **페이지별 순차 적용**:
   - 대시보드 (리스트)
   - 대시보드 상세 (상세 + mutation)
   - 홈페이지 (생성)
6. **기존 useState/useEffect 코드 제거**

---

## 10. 예상 이점

| 항목 | Before | After |
|------|--------|-------|
| **캐싱** | 없음 | 5분 캐시 |
| **리스트 ↔ 상세 이동** | 매번 로딩 | 즉시 표시 |
| **코드량** | ~50줄/페이지 | ~15줄/페이지 |
| **에러 핸들링** | 수동 | 자동 |
| **Loading 상태** | 수동 관리 | 자동 |
| **데이터 동기화** | 수동 refetch | 자동 invalidation |

---

## 11. DevTools 활용

개발 모드에서 React Query DevTools를 통해:
- 현재 캐시된 쿼리 확인
- 캐시 상태 (fresh/stale/fetching) 모니터링
- 수동으로 invalidate/refetch 테스트
- 에러 상황 시뮬레이션
