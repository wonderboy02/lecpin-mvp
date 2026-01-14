# Task C: README 커스터마이징 + Guide + 온보딩

## 담당자 정보
- **담당:** C
- **브랜치:** `feature/readme-guide-onboarding`
- **예상 기간:** 2주
- **의존성:** 없음 (병렬 진행 가능)

---

## 1. 목표

### 1.1 README 커스터마이징
- GitHub 레포 생성 시 README에 과제 목표/요구사항 자동 작성
- 학습자가 바로 과제 내용을 확인할 수 있도록

### 1.2 Guide 페이지
- Header의 Guide 링크 실제 페이지로 연결
- 서비스 사용 방법 안내

### 1.3 온보딩 플로우
- 신규 사용자에게 서비스 소개
- 첫 과제 시작 가이드

### 완료 조건
- [ ] 레포 생성 시 README 자동 업데이트
- [ ] `/guide` 페이지 구현
- [ ] `/onboarding` 페이지 구현
- [ ] 온보딩 완료 여부 저장

---

## 2. README 커스터마이징

### 2.1 GitHub Contents API 이해

레포 생성 후 README 파일을 업데이트하려면 GitHub Contents API 사용:

```
PUT /repos/{owner}/{repo}/contents/{path}
```

**필요 정보:**
- 사용자의 GitHub 토큰 (이미 저장됨)
- 레포 이름 (생성 시 반환됨)
- README 내용

### 2.2 API 구현

**파일:** `src/app/api/tasks/[id]/readme/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params {
  params: { id: string }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const supabase = await createClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id: taskId } = params

    // 사용자 정보 (GitHub 토큰) 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('github_token, github_username')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.github_token) {
      return NextResponse.json({ error: 'GitHub 토큰이 없습니다.' }, { status: 401 })
    }

    // 과제 정보 가져오기
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, lectures(*)')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: '과제를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!task.github_repo_url) {
      return NextResponse.json({ error: '연결된 GitHub 레포지토리가 없습니다.' }, { status: 400 })
    }

    // 레포 이름 추출 (예: https://github.com/username/repo -> repo)
    const repoUrlParts = task.github_repo_url.split('/')
    const repoName = repoUrlParts[repoUrlParts.length - 1]
    const owner = repoUrlParts[repoUrlParts.length - 2]

    // README 내용 생성
    const readmeContent = generateReadmeContent(task)

    // 기존 README 파일 정보 가져오기 (sha 필요)
    const getFileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/README.md`,
      {
        headers: {
          'Authorization': `Bearer ${profile.github_token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    let sha: string | undefined
    if (getFileRes.ok) {
      const fileData = await getFileRes.json()
      sha = fileData.sha
    }

    // README 업데이트
    const updateRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/README.md`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${profile.github_token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: 'Update README with task details',
          content: Buffer.from(readmeContent).toString('base64'),
          ...(sha && { sha }),  // 기존 파일이 있으면 sha 포함
        }),
      }
    )

    if (!updateRes.ok) {
      const errorData = await updateRes.json()
      console.error('GitHub API error:', errorData)
      return NextResponse.json({ error: 'README 업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('README update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

function generateReadmeContent(task: any): string {
  const steps = task.steps || []
  const successCriteria = task.success_criteria || []
  const techStack = task.tech_stack || []

  return `# ${task.title}

> Lecpin 실습 과제

## 📋 과제 개요

${task.description}

### 왜 이 과제인가요?

${task.reason}

---

## 🎯 학습 목표

이 과제를 완료하면 다음을 할 수 있게 됩니다:

${successCriteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

---

## 🛠 기술 스택

${techStack.map((t: string) => `- ${t}`).join('\n')}

---

## 📝 구현 단계

${steps.map((step: any, i: number) => `
### Step ${step.order || i + 1}${step.title ? `: ${step.title}` : ''}

${step.content}
`).join('\n')}

---

## ⏱ 예상 소요 시간

${task.estimated_time}

## 📊 난이도

${task.difficulty === 'beginner' ? '🟢 초급' : task.difficulty === 'intermediate' ? '🟡 중급' : '🔴 고급'}

---

## 🚀 시작하기

1. 이 레포지토리를 클론합니다
2. 필요한 패키지를 설치합니다
3. 위의 구현 단계를 따라 진행합니다
4. 완료 후 Lecpin에서 제출합니다

---

<p align="center">
  <sub>Generated by <a href="https://lecpin.com">Lecpin</a></sub>
</p>
`
}
```

### 2.3 레포 생성 API 수정

**파일:** `src/app/api/tasks/create-repo/route.ts` 수정

레포 생성 후 자동으로 README 업데이트:

```typescript
// 기존 코드 끝부분 수정

// 과제에 레포 URL 저장
await supabase
  .from('tasks')
  .update({ github_repo_url: repoUrl })
  .eq('id', task_id)

// README 업데이트 (비동기로 실행 - 실패해도 레포 생성은 성공)
fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/tasks/${task_id}/readme`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    // 내부 API 호출이므로 쿠키 전달
    'Cookie': request.headers.get('cookie') || '',
  },
}).catch(err => {
  console.error('README update failed (non-blocking):', err)
})

return NextResponse.json({
  success: true,
  repo_url: repoUrl,
  repo_name: repoData.name,
})
```

---

## 3. Guide 페이지

### 3.1 페이지 구현

**파일:** `src/app/guide/page.tsx`

```typescript
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    number: "01",
    title: "강의 영상 입력",
    description: "학습하고 싶은 YouTube 강의 URL을 입력하세요. AI가 강의 내용을 분석합니다.",
    icon: "🎬",
  },
  {
    number: "02",
    title: "역량 분석",
    description: "AI가 강의에서 배울 수 있는 핵심 역량을 추출하고 요약합니다.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "실습 과제 생성",
    description: "분석된 역량을 기반으로 맞춤형 실습 과제가 자동 생성됩니다.",
    icon: "📝",
  },
  {
    number: "04",
    title: "GitHub 레포 생성",
    description: "클릭 한 번으로 과제용 GitHub 저장소가 생성됩니다. README에 과제 내용이 포함됩니다.",
    icon: "🔗",
  },
  {
    number: "05",
    title: "코드 작성 & 제출",
    description: "과제를 완료하고 코드를 푸시한 후 제출 버튼을 누르세요.",
    icon: "💻",
  },
  {
    number: "06",
    title: "AI 코드 리뷰",
    description: "시니어 개발자 수준의 AI가 코드를 분석하고 상세한 피드백을 제공합니다.",
    icon: "✨",
  },
]

const faqs = [
  {
    question: "어떤 종류의 강의를 분석할 수 있나요?",
    answer: "프로그래밍, 개발, 기술 관련 YouTube 강의를 분석할 수 있습니다. 자막이 있는 강의가 더 정확한 분석이 가능합니다.",
  },
  {
    question: "GitHub 계정이 필요한가요?",
    answer: "네, GitHub 계정으로 로그인해야 합니다. 실습 과제를 위한 저장소 생성과 코드 제출에 사용됩니다.",
  },
  {
    question: "AI 피드백은 얼마나 정확한가요?",
    answer: "GPT-4o 기반으로 시니어 개발자 수준의 코드 리뷰를 제공합니다. 코드 품질, 모범 사례, 개선점 등을 종합적으로 분석합니다.",
  },
  {
    question: "한국어로 피드백을 받을 수 있나요?",
    answer: "네, 헤더에서 언어를 선택하면 영어 강의도 한국어로 분석 및 피드백을 받을 수 있습니다.",
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Lecpin 사용 가이드
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            강의를 실습으로, 실습을 성장으로
          </p>
          <Button asChild size="lg">
            <Link href="/">지금 시작하기</Link>
          </Button>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
            어떻게 작동하나요?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.number} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{step.icon}</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {step.number}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-12 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            준비되셨나요?
          </h2>
          <p className="text-muted-foreground mb-8">
            지금 바로 강의를 입력하고 실습을 시작해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">강의 분석 시작</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">GitHub로 로그인</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
```

---

## 4. 온보딩 플로우

### 4.1 온보딩 상태 저장

**DB 수정 (users 테이블):**

```sql
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

### 4.2 온보딩 페이지 구현

**파일:** `src/app/onboarding/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const onboardingSteps = [
  {
    title: "Lecpin에 오신 것을 환영합니다! 👋",
    description: "강의 영상을 실습 과제로 바꿔주는 AI 학습 도우미입니다.",
    image: "/onboarding/welcome.svg",  // 이미지 추가 필요
  },
  {
    title: "1단계: 강의 분석 🎬",
    description: "YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석합니다.",
    image: "/onboarding/analyze.svg",
  },
  {
    title: "2단계: 실습 과제 📝",
    description: "분석 결과를 바탕으로 맞춤형 실습 과제가 자동 생성됩니다.",
    image: "/onboarding/task.svg",
  },
  {
    title: "3단계: 코드 리뷰 ✨",
    description: "작성한 코드를 제출하면 시니어 개발자 수준의 AI 피드백을 받을 수 있습니다.",
    image: "/onboarding/review.svg",
  },
  {
    title: "시작할 준비가 됐어요! 🚀",
    description: "지금 바로 첫 번째 강의를 분석해보세요.",
    image: "/onboarding/ready.svg",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(0)

  const isLastStep = currentStep === onboardingSteps.length - 1
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  const completeOnboarding = async () => {
    if (isLoggedIn) {
      try {
        await fetch('/api/users/onboarding', {
          method: 'POST',
        })
      } catch (error) {
        console.error('Failed to save onboarding status:', error)
      }
    }

    // 대시보드 또는 메인으로 이동
    router.push('/dashboard')
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground text-right mt-2">
            {currentStep + 1} / {onboardingSteps.length}
          </p>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            {/* 이미지 영역 (선택) */}
            <div className="w-48 h-48 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <span className="text-6xl">
                {currentStep === 0 && "👋"}
                {currentStep === 1 && "🎬"}
                {currentStep === 2 && "📝"}
                {currentStep === 3 && "✨"}
                {currentStep === 4 && "🚀"}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-3">
              {step.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {step.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  이전
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {isLastStep ? "시작하기" : "다음"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Button */}
        {!isLastStep && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full mt-4 text-muted-foreground"
          >
            건너뛰기
          </Button>
        )}
      </div>
    </div>
  )
}
```

### 4.3 온보딩 완료 API

**파일:** `src/app/api/users/onboarding/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update onboarding error:', updateError)
      return NextResponse.json({ error: '업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      onboarding_completed: profile?.onboarding_completed || false
    })

  } catch (error) {
    console.error('Onboarding check error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

### 4.4 로그인 후 온보딩 리다이렉트

**파일:** `src/app/api/auth/callback/route.ts` 수정

```typescript
// 기존 콜백 로직 끝에 추가

// 온보딩 완료 여부 확인
const { data: profile } = await supabase
  .from('users')
  .select('onboarding_completed')
  .eq('id', user.id)
  .single()

// 온보딩 미완료 시 온보딩 페이지로 리다이렉트
if (!profile?.onboarding_completed) {
  return NextResponse.redirect(new URL('/onboarding', request.url))
}

// 기존 리다이렉트
return NextResponse.redirect(new URL('/dashboard', request.url))
```

---

## 5. 훅 추가

### 5.1 useOnboarding 훅

**파일:** `src/hooks/use-onboarding.ts`

```typescript
"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/use-user'

export function useOnboarding() {
  const { isLoggedIn, loading: userLoading } = useUser()
  const [completed, setCompleted] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && isLoggedIn) {
      checkOnboardingStatus()
    } else if (!userLoading && !isLoggedIn) {
      setLoading(false)
      setCompleted(null)
    }
  }, [isLoggedIn, userLoading])

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/users/onboarding')
      const data = await res.json()
      setCompleted(data.onboarding_completed)
    } catch (error) {
      console.error('Check onboarding error:', error)
      setCompleted(false)
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      await fetch('/api/users/onboarding', { method: 'POST' })
      setCompleted(true)
    } catch (error) {
      console.error('Complete onboarding error:', error)
    }
  }

  return { completed, loading, completeOnboarding }
}
```

---

## 6. 타입 정의 추가

**파일:** `src/types/index.ts` 추가

```typescript
// User 타입 확장
export interface User {
  // ... 기존 필드
  onboarding_completed: boolean
}
```

---

## 7. 테스트 체크리스트

### README 커스터마이징
- [ ] 레포 생성 시 README 자동 업데이트
- [ ] README에 과제 제목/설명 포함
- [ ] README에 구현 단계 포함
- [ ] README에 성공 기준 포함
- [ ] 기존 README 있을 때 덮어쓰기 동작

### Guide 페이지
- [ ] `/guide` 페이지 접근 가능
- [ ] Header의 Guide 링크 동작
- [ ] 모바일 반응형
- [ ] 비로그인 상태에서도 접근 가능

### 온보딩
- [ ] 신규 사용자 로그인 시 온보딩 페이지 표시
- [ ] 온보딩 단계별 이동
- [ ] 건너뛰기 기능
- [ ] 온보딩 완료 후 대시보드 이동
- [ ] 완료 후 재방문 시 온보딩 스킵

---

## 8. 참고 사항

### A 담당자와 협업
- 온보딩 완료 후 `/dashboard`로 리다이렉트
- 대시보드에서 "첫 과제 시작" 안내 배너 추가 가능

### B 담당자와 협업
- Guide 페이지에서 언어 설정 안내 포함
- 온보딩에 언어 선택 단계 추가 가능 (선택)

---

## 9. 추가 개선 아이디어

### 9.1 온보딩에 언어 선택 추가

```typescript
// onboardingSteps에 추가
{
  title: "언어를 선택하세요 🌍",
  description: "피드백을 받고 싶은 언어를 선택하세요. 나중에 변경할 수 있습니다.",
  component: <LanguageSelector />,
}
```

### 9.2 Guide 페이지 다국어

B의 언어 컨텍스트 활용:
```typescript
import { useLanguage } from '@/contexts/language-context'

const { language } = useLanguage()
const content = guideContent[language]  // ko/en 별도 컨텐츠
```

### 9.3 README 템플릿 커스터마이징

환경 변수로 템플릿 위치 지정:
```env
README_TEMPLATE_URL=https://raw.githubusercontent.com/...
```

---

## 10. 완료 후 다음 단계

1. A의 대시보드와 연결 확인
2. B의 언어 설정과 Guide 페이지 연동
3. 전체 사용자 플로우 E2E 테스트
