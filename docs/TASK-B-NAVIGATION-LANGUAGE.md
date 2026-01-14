# Task B: 네비게이션 + 언어 설정

## 담당자 정보
- **담당:** B
- **브랜치:** `feature/navigation-language`
- **예상 기간:** 2주
- **의존성:** A의 DB 마이그레이션 (users.preferred_language)

---

## 1. 목표

### 1.1 단계별 네비게이션
- 사용자가 이전/다음 단계로 자유롭게 이동 가능
- 완료된 단계는 클릭으로 바로 이동 가능
- 현재 단계와 진행 상태 시각적 표시

### 1.2 언어 설정
- Header에서 언어 선택 (한국어/영어)
- 선택한 언어에 따라 AI 출력 언어 변경
- 강의 원어와 관계없이 선택 언어로 요약/피드백 제공

### 완료 조건
- [ ] StepNavigation 컴포넌트 구현
- [ ] 이전/다음 버튼 동작
- [ ] 완료 단계 클릭 이동
- [ ] Header에 언어 드롭다운 추가
- [ ] 언어 설정 DB 저장
- [ ] AI 프롬프트에 언어 설정 반영

---

## 2. DB 마이그레이션

### 2.1 users 테이블 수정

**파일:** `supabase/migrations/002_add_preferred_language.sql`

```sql
-- 사용자 언어 설정 필드 추가
ALTER TABLE users
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'ko'
CHECK (preferred_language IN ('ko', 'en'));

-- 기존 사용자 기본값 설정
UPDATE users SET preferred_language = 'ko' WHERE preferred_language IS NULL;
```

---

## 3. 타입 정의

### 3.1 `src/types/index.ts` 추가

```typescript
// 지원 언어
export type Language = 'ko' | 'en'

// 언어 설정 관련
export interface LanguageConfig {
  code: Language
  label: string
  flag: string
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

// User 타입에 추가
export interface User {
  // ... 기존 필드
  preferred_language: Language
}
```

---

## 4. 언어 Context 구현

### 4.1 LanguageContext

**파일:** `src/contexts/language-context.tsx`

```typescript
"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useUser } from '@/hooks/use-user'
import type { Language } from '@/types'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { profile, isLoggedIn } = useUser()
  const [language, setLanguageState] = useState<Language>('ko')
  const [isLoading, setIsLoading] = useState(false)

  // 프로필에서 언어 설정 로드
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language as Language)
    }
  }, [profile])

  // 언어 변경 (DB 저장)
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang)  // 즉시 UI 반영

    if (!isLoggedIn) {
      // 비로그인 시 로컬스토리지에만 저장
      localStorage.setItem('preferred_language', lang)
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/users/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      })

      if (!res.ok) {
        console.error('Failed to update language')
        // 실패 시 롤백하지 않음 (UI는 유지)
      }
    } catch (error) {
      console.error('Language update error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  // 비로그인 시 로컬스토리지에서 로드
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('preferred_language') as Language
      if (saved && (saved === 'ko' || saved === 'en')) {
        setLanguageState(saved)
      }
    }
  }, [isLoggedIn])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
```

### 4.2 Provider 적용

**파일:** `src/app/layout.tsx` 수정

```typescript
import { LanguageProvider } from '@/contexts/language-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider ...>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 5. API 구현

### 5.1 PATCH `/api/users/language`

**파일:** `src/app/api/users/language/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { language } = body

    if (!language || !['ko', 'en'].includes(language)) {
      return NextResponse.json({ error: '유효하지 않은 언어입니다.' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update language error:', updateError)
      return NextResponse.json({ error: '언어 설정 변경에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, language })

  } catch (error) {
    console.error('Language update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

---

## 6. 컴포넌트 구현

### 6.1 StepNavigation 컴포넌트

**파일:** `src/components/step-navigation.tsx`

```typescript
"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import type { Step } from "@/types"

const steps: { key: Step; label: string }[] = [
  { key: "summary", label: "역량 분석" },
  { key: "task", label: "실습 과제" },
  { key: "submit", label: "결과 제출" },
  { key: "feedback", label: "피드백" },
]

interface StepNavigationProps {
  currentStep: Step
  completedSteps: Step[]
  onStepClick: (step: Step) => void
  onPrevious?: () => void
  onNext?: () => void
  showNavButtons?: boolean
}

export function StepNavigation({
  currentStep,
  completedSteps,
  onStepClick,
  onPrevious,
  onNext,
  showNavButtons = false,
}: StepNavigationProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  const isStepClickable = (stepKey: Step) => {
    return completedSteps.includes(stepKey) || stepKey === currentStep
  }

  const isStepCompleted = (stepKey: Step) => {
    return completedSteps.includes(stepKey)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].key
      onStepClick(prevStep)
      onPrevious?.()
    }
  }

  const handleNext = () => {
    if (currentIndex < steps.length - 1 && isStepCompleted(currentStep)) {
      const nextStep = steps[currentIndex + 1].key
      onStepClick(nextStep)
      onNext?.()
    }
  }

  return (
    <nav className="space-y-4" aria-label="Progress">
      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key
          const isCompleted = isStepCompleted(step.key)
          const isClickable = isStepClickable(step.key)

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center transition-all duration-300
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300 mb-2
                    ${isActive
                      ? 'bg-foreground text-background'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }
                    ${isClickable && !isActive ? 'hover:bg-muted-foreground/20' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    text-xs font-medium tracking-wide transition-colors duration-300
                    ${isActive
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    hidden sm:block w-12 lg:w-20 h-px mx-3
                    transition-colors duration-300
                    ${isCompleted ? 'bg-green-500/50' : 'bg-border'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      {showNavButtons && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === steps.length - 1 || !isStepCompleted(currentStep)}
            className="gap-2"
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </nav>
  )
}
```

### 6.2 LanguageSelector 컴포넌트

**파일:** `src/components/language-selector.tsx`

```typescript
"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { LANGUAGES, type Language } from "@/types"

export function LanguageSelector() {
  const { language, setLanguage, isLoading } = useLanguage()

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1.5"
          disabled={isLoading}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`gap-2 ${language === lang.code ? 'bg-muted' : ''}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 6.3 Header 수정

**파일:** `src/components/header.tsx` 수정

```typescript
'use client'

import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language-selector"  // 추가
import Link from "next/link"

export function Header() {
  const { user, profile, loading, signOut, isLoggedIn } = useUser()

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold text-lg tracking-tight text-foreground hover:opacity-70 transition-opacity"
        >
          Lecpin
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/guide"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Guide
            </Link>
          </nav>

          {/* Language Selector - 항상 표시 */}
          <LanguageSelector />

          {!loading && (
            <>
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0 hover:bg-muted"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                          alt={profile?.name || '사용자'}
                        />
                        <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                          {(profile?.name || profile?.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.name || profile?.github_username || '사용자'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email || user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">내 학습</Link>
                    </DropdownMenuItem>
                    {profile?.github_username && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://github.com/${profile.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub Profile
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-destructive focus:text-destructive"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-sm font-normal h-8 px-3"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
```

---

## 7. AI 프롬프트에 언어 반영

### 7.1 강의 분석 API 수정

**파일:** `src/app/api/lectures/analyze/route.ts` 수정

```typescript
// 요청에서 언어 설정 받기
const { youtube_url, language = 'ko' } = body

// 프롬프트에 언어 지시 추가
const systemPrompt = language === 'ko'
  ? `당신은 교육 콘텐츠 분석 전문가입니다. 모든 응답을 한국어로 작성해주세요.`
  : `You are an educational content analysis expert. Please write all responses in English.`

const userPrompt = language === 'ko'
  ? `다음 강의 내용을 분석하여 핵심 역량을 추출해주세요...`
  : `Please analyze the following lecture content and extract key competencies...`
```

### 7.2 과제 생성 API 수정

**파일:** `src/app/api/tasks/generate/route.ts` 수정

```typescript
// 요청에서 언어 설정 받기
const { lecture_id, language = 'ko' } = body

// 프롬프트에 언어 지시 추가
const systemPrompt = language === 'ko'
  ? `당신은 실습 과제를 설계하는 시니어 개발자입니다. 모든 응답을 한국어로 작성해주세요.`
  : `You are a senior developer who designs practical exercises. Please write all responses in English.`
```

### 7.3 피드백 생성 API 수정

**파일:** `src/app/api/feedback/generate/route.ts` 수정

```typescript
// 요청에서 언어 설정 받기
const { submission_id, language = 'ko' } = body

// 프롬프트에 언어 지시 추가
const systemPrompt = language === 'ko'
  ? `당신은 코드 리뷰를 진행하는 시니어 개발자입니다. 모든 피드백을 한국어로 작성해주세요.`
  : `You are a senior developer conducting code reviews. Please write all feedback in English.`
```

### 7.4 클라이언트에서 언어 전달

각 컴포넌트에서 API 호출 시 언어 포함:

```typescript
// 예: competency-summary.tsx
import { useLanguage } from '@/contexts/language-context'

export function CompetencySummary({ lecture, onTaskGenerated }) {
  const { language } = useLanguage()

  const handleGenerateTask = async () => {
    const res = await fetch('/api/tasks/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lecture_id: lecture.id,
        language,  // 언어 설정 전달
      }),
    })
    // ...
  }
}
```

---

## 8. 테스트 체크리스트

### StepNavigation
- [ ] 현재 단계 하이라이트 표시
- [ ] 완료된 단계에 체크 표시
- [ ] 완료된 단계 클릭 시 이동
- [ ] 미완료 단계 클릭 불가
- [ ] 이전/다음 버튼 동작 (선택적)

### LanguageSelector
- [ ] 현재 언어 표시
- [ ] 언어 변경 시 즉시 UI 반영
- [ ] 로그인 시 DB 저장
- [ ] 비로그인 시 로컬스토리지 저장
- [ ] 새로고침 후 설정 유지

### AI 언어 반영
- [ ] 한국어 선택 → 한국어 분석/피드백
- [ ] 영어 선택 → 영어 분석/피드백
- [ ] 영어 강의 + 한국어 설정 → 한국어 출력
- [ ] 한국어 강의 + 영어 설정 → 영어 출력

---

## 9. 참고 사항

### A 담당자와 협업
- `StepNavigation` 컴포넌트 A의 Dashboard/[id] 페이지에서 사용
- Props 인터페이스 변경 시 A에게 공유

### C 담당자와 협업
- Guide 페이지에서 언어 설정 안내 문구 포함
- 온보딩 플로우에서 언어 선택 단계 추가 가능

---

## 10. i18n 추가 확장 (선택 사항)

현재는 AI 출력만 언어 변경. 향후 UI 텍스트도 다국어 지원하려면:

### 간단한 번역 시스템

```typescript
// src/lib/i18n/translations.ts
const translations = {
  ko: {
    'nav.home': '홈',
    'nav.dashboard': '내 학습',
    'nav.guide': '가이드',
    'button.submit': '제출하기',
    // ...
  },
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'My Learning',
    'nav.guide': 'Guide',
    'button.submit': 'Submit',
    // ...
  },
}

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || key
}
```

### Context에 t 함수 추가

```typescript
// language-context.tsx
const t = useCallback((key: string) => {
  return translations[language]?.[key] || key
}, [language])

return (
  <LanguageContext.Provider value={{ language, setLanguage, isLoading, t }}>
    {children}
  </LanguageContext.Provider>
)
```

---

## 11. 완료 후 다음 단계

1. A의 Dashboard 페이지에 StepNavigation 통합 확인
2. 각 API에 언어 파라미터 테스트
3. 전체 플로우에서 언어 일관성 검증
