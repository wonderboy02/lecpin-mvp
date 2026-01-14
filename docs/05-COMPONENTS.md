# 05. 컴포넌트 수정 가이드

## 목차
1. [디렉토리 구조](#1-디렉토리-구조)
2. [새로 추가할 파일](#2-새로-추가할-파일)
3. [수정할 컴포넌트](#3-수정할-컴포넌트)
4. [상태 관리](#4-상태-관리)
5. [구현 순서](#5-구현-순서)

---

## 1. 디렉토리 구조

### 현재 구조

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트 (수정 불필요)
│   ├── header.tsx
│   ├── footer.tsx
│   ├── lecture-input.tsx      # 수정 필요
│   ├── competency-summary.tsx # 수정 필요
│   ├── practical-task.tsx     # 수정 필요
│   ├── submission-upload.tsx  # 수정 필요
│   ├── ai-feedback.tsx        # 수정 필요
│   └── theme-provider.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
└── types/
    └── index.ts
```

### 목표 구조

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts       # 새로 추가
│   │   ├── login/
│   │   │   └── page.tsx       # 새로 추가
│   │   └── error/
│   │       └── page.tsx       # 새로 추가
│   └── api/
│       ├── lectures/
│       │   └── analyze/
│       │       └── route.ts   # 새로 추가
│       ├── tasks/
│       │   ├── generate/
│       │   │   └── route.ts   # 새로 추가
│       │   └── create-repo/
│       │       └── route.ts   # 새로 추가
│       ├── submissions/
│       │   ├── github/
│       │   │   └── route.ts   # 새로 추가
│       │   └── upload/
│       │       └── route.ts   # 새로 추가
│       └── feedback/
│           └── generate/
│               └── route.ts   # 새로 추가
├── components/
│   ├── ui/
│   ├── auth/
│   │   ├── login-button.tsx   # 새로 추가
│   │   ├── logout-button.tsx  # 새로 추가
│   │   └── user-menu.tsx      # 새로 추가
│   ├── header.tsx             # 수정 필요 (로그인 상태 표시)
│   ├── footer.tsx
│   ├── lecture-input.tsx
│   ├── competency-summary.tsx
│   ├── practical-task.tsx
│   ├── submission-upload.tsx
│   ├── ai-feedback.tsx
│   └── theme-provider.tsx
├── hooks/
│   ├── use-auth.ts            # 새로 추가
│   └── use-lecture.ts         # 새로 추가
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # 새로 추가 (브라우저용)
│   │   ├── server.ts          # 새로 추가 (서버용)
│   │   ├── middleware.ts      # 새로 추가
│   │   └── database.ts        # 자동 생성 (gen:types)
│   ├── openai/
│   │   ├── index.ts           # 새로 추가
│   │   ├── analyze-competencies.ts
│   │   ├── generate-task.ts
│   │   └── generate-code-review.ts
│   ├── youtube.ts             # 새로 추가
│   ├── yt-dlp.ts              # 새로 추가
│   ├── github.ts              # 새로 추가
│   ├── zip.ts                 # 새로 추가
│   ├── auth.ts                # 새로 추가
│   └── utils.ts
├── types/
│   └── index.ts               # 수정 필요
└── middleware.ts              # 새로 추가
```

---

## 2. 새로 추가할 파일

### 2.1 Supabase 클라이언트

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database'

export async function createClient() {
  const cookieStore = await cookies()

  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  )
}
```

### 2.2 Middleware (인증 보호)

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 로그인이 필요한 페이지 보호
  if (!user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 이미 로그인된 사용자가 로그인 페이지 접근 시
  if (user && request.nextUrl.pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2.3 Auth Hook

```typescript
// src/hooks/use-auth.ts
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 현재 세션 확인
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading }
}
```

### 2.4 Login Button

```typescript
// src/components/auth/login-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user user:email',
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <Button onClick={handleLogin} className="gap-2">
      <Github className="w-4 h-4" />
      GitHub로 로그인
    </Button>
  )
}
```

### 2.5 로그인 페이지

```typescript
// src/app/auth/login/page.tsx
import { LoginButton } from '@/components/auth/login-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Lecpin</CardTitle>
          <CardDescription>
            강의를 실습으로 바꿔보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <LoginButton />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 3. 수정할 컴포넌트

### 3.1 page.tsx (메인 페이지)

**변경 사항:**
- 상태 관리를 `useState`에서 실제 데이터로 변경
- API 호출 로직 추가
- 로딩/에러 상태 처리

```typescript
// src/app/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/header'
import { LectureInput } from '@/components/lecture-input'
import { CompetencySummary } from '@/components/competency-summary'
import { PracticalTask } from '@/components/practical-task'
import { SubmissionUpload } from '@/components/submission-upload'
import { AIFeedback } from '@/components/ai-feedback'
import { Footer } from '@/components/footer'
import { Database } from '@/lib/supabase/database'

type Lecture = Database['public']['Tables']['lectures']['Row']
type Competency = Database['public']['Tables']['competencies']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']
type Feedback = Database['public']['Tables']['feedbacks']['Row']

type Step = 'input' | 'summary' | 'task' | 'submit' | 'feedback'

export default function Home() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 실제 데이터 상태
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [task, setTask] = useState<Task | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  // 강의 분석 핸들러
  const handleAnalyze = async (youtubeUrl: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/lectures/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: youtubeUrl })
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error.message)
      }
      
      setLecture(data.data.lecture)
      setCompetencies(data.data.competencies)
      setCurrentStep('summary')
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 과제 생성 핸들러
  const handleGenerateTask = async () => {
    if (!lecture) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecture_id: lecture.id })
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error.message)
      }
      
      setTask(data.data.task)
      setCurrentStep('task')
    } catch (err) {
      setError(err instanceof Error ? err.message : '과제 생성 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // ... 나머지 핸들러들

  const handleReset = () => {
    setCurrentStep('input')
    setLecture(null)
    setCompetencies([])
    setTask(null)
    setSubmission(null)
    setFeedback(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={user} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Step Indicator */}
        {/* ... */}
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}
        
        {/* Step Components */}
        {currentStep === 'input' && (
          <LectureInput 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
          />
        )}
        {currentStep === 'summary' && lecture && (
          <CompetencySummary 
            lecture={lecture}
            competencies={competencies}
            onNext={handleGenerateTask}
            isLoading={isLoading}
          />
        )}
        {/* ... 나머지 단계들 */}
      </main>
      <Footer />
    </div>
  )
}
```

### 3.2 lecture-input.tsx

**변경 사항:**
- URL 전용으로 단순화 (파일 업로드 제거)
- 실제 API 호출
- 로딩 상태 표시

```typescript
// src/components/lecture-input.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Youtube, Sparkles, Loader2 } from 'lucide-react'

interface LectureInputProps {
  onAnalyze: (youtubeUrl: string) => Promise<void>
  isLoading: boolean
}

export function LectureInput({ onAnalyze, isLoading }: LectureInputProps) {
  const [url, setUrl] = useState('')

  const isValidYouTubeUrl = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    return regex.test(url)
  }

  const handleSubmit = async () => {
    if (!isValidYouTubeUrl(url)) return
    await onAnalyze(url)
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-semibold text-foreground">
          강의를 실습으로 바꿔보세요
        </CardTitle>
        <CardDescription className="text-base">
          YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고 맞춤형 실습 과제를 생성합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="lecture-url" className="text-sm font-medium flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            YouTube 강의 URL
          </Label>
          <Input
            id="lecture-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            자막이 있는 YouTube 강의만 지원됩니다
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValidYouTubeUrl(url) || isLoading}
          className="w-full h-11 text-base font-medium gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              강의 분석하기
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 3.3 competency-summary.tsx

**변경 사항:**
- Props로 실제 데이터 받기
- 하드코딩된 데이터 제거

```typescript
// src/components/competency-summary.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Clock, Target, ArrowRight, Loader2 } from 'lucide-react'
import { Database } from '@/lib/supabase/database'

type Lecture = Database['public']['Tables']['lectures']['Row']
type Competency = Database['public']['Tables']['competencies']['Row']

interface CompetencySummaryProps {
  lecture: Lecture
  competencies: Competency[]
  onNext: () => Promise<void>
  isLoading: boolean
}

export function CompetencySummary({ 
  lecture, 
  competencies, 
  onNext, 
  isLoading 
}: CompetencySummaryProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '알 수 없음'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}시간 ${minutes}분`
    return `${minutes}분`
  }

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
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {lecture.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(lecture.duration_seconds)}
                </span>
                <span>YouTube</span>
                {lecture.language && (
                  <span>{lecture.language}</span>
                )}
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
          <p className="text-sm text-muted-foreground mb-4">
            이 강의를 통해 습득할 수 있는 핵심 개발 역량입니다
          </p>
          <div className="space-y-4">
            {competencies.map((competency, index) => (
              <div 
                key={competency.id} 
                className="flex gap-3 p-3 rounded-lg bg-background/60 border border-border/50"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    {competency.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {competency.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onNext} 
        disabled={isLoading}
        className="w-full h-11 text-base font-medium gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            과제 생성 중...
          </>
        ) : (
          <>
            코딩 실습 과제 생성하기
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  )
}
```

### 3.4 나머지 컴포넌트

**practical-task.tsx:**
- Props로 `Task` 데이터 받기
- GitHub Repo 생성 버튼 추가

**submission-upload.tsx:**
- GitHub Repo URL 제출 옵션 추가
- 실제 파일 업로드 API 연동

**ai-feedback.tsx:**
- Props로 `Feedback` 데이터 받기

---

## 4. 상태 관리

### 4.1 전역 상태 (선택사항)

복잡해지면 Zustand 또는 Context API 사용 고려:

```typescript
// src/store/lecture-store.ts (Zustand 예시)
import { create } from 'zustand'

interface LectureState {
  lecture: Lecture | null
  competencies: Competency[]
  task: Task | null
  submission: Submission | null
  feedback: Feedback | null
  currentStep: Step
  isLoading: boolean
  error: string | null
  
  setLecture: (lecture: Lecture) => void
  setCompetencies: (competencies: Competency[]) => void
  // ... 액션들
  reset: () => void
}

export const useLectureStore = create<LectureState>((set) => ({
  lecture: null,
  competencies: [],
  task: null,
  submission: null,
  feedback: null,
  currentStep: 'input',
  isLoading: false,
  error: null,
  
  setLecture: (lecture) => set({ lecture }),
  setCompetencies: (competencies) => set({ competencies }),
  reset: () => set({
    lecture: null,
    competencies: [],
    task: null,
    submission: null,
    feedback: null,
    currentStep: 'input',
    error: null
  })
}))
```

---

## 5. 구현 순서

### Phase 1: 기초 설정
1. [ ] `@supabase/ssr` 패키지 설치
2. [ ] Supabase 클라이언트 파일 생성 (`client.ts`, `server.ts`)
3. [ ] Middleware 설정
4. [ ] 타입 생성 스크립트 추가 및 실행

### Phase 2: 인증
5. [ ] 로그인 페이지 생성
6. [ ] Auth callback 라우트 생성
7. [ ] LoginButton, LogoutButton 컴포넌트
8. [ ] Header에 로그인 상태 표시
9. [ ] useAuth 훅 구현

### Phase 3: 강의 분석
10. [ ] YouTube 유틸 함수 구현
11. [ ] yt-dlp 자막 추출 함수 구현
12. [ ] OpenAI 역량 분석 함수 구현
13. [ ] `/api/lectures/analyze` API 구현
14. [ ] LectureInput 컴포넌트 수정
15. [ ] CompetencySummary 컴포넌트 수정

### Phase 4: 과제 생성
16. [ ] OpenAI 과제 생성 함수 구현
17. [ ] `/api/tasks/generate` API 구현
18. [ ] GitHub API 연동 함수 구현
19. [ ] `/api/tasks/create-repo` API 구현
20. [ ] PracticalTask 컴포넌트 수정

### Phase 5: 제출 & 피드백
21. [ ] `/api/submissions/upload` API 구현
22. [ ] `/api/submissions/github` API 구현
23. [ ] OpenAI 코드 리뷰 함수 구현
24. [ ] `/api/feedback/generate` API 구현
25. [ ] SubmissionUpload 컴포넌트 수정
26. [ ] AIFeedback 컴포넌트 수정

### Phase 6: 테스트 & 배포
27. [ ] 전체 플로우 테스트
28. [ ] 에러 핸들링 점검
29. [ ] Railway 배포
30. [ ] Production 테스트
