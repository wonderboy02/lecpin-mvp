"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { LectureInput } from "@/components/lecture-input"
import { Footer } from "@/components/footer"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import type { LectureWithCompetencies } from "@/types"

export default function Home() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [isCreating, setIsCreating] = useState(false)

  const handleAnalyzeComplete = async (lectureData: LectureWithCompetencies) => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    try {
      setIsCreating(true)

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
      } else {
        console.error('Failed to create user task:', data.error)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Create user task error:', error)
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Text Content */}
              <div className="animate-fade-in">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  AI 실습 코치
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6">
                  강의를 실습으로<br />
                  바꿔보세요
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                  YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고
                  맞춤형 실습 과제를 생성합니다.
                </p>

                {/* Quick Access - Logged In User */}
                {isLoggedIn && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="group"
                  >
                    <span>내 학습 대시보드</span>
                    <span className="ml-2 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </Button>
                )}
              </div>

              {/* Right: Hero Image */}
              <div className="aspect-[4/3] bg-muted rounded-sm animate-fade-in animate-delay-100 relative overflow-hidden">
                {/*
                  권장 이미지: 노트북에서 강의를 보는 장면
                  - 화면에 YouTube 또는 강의 영상이 보이는 모습
                  - 옆에 노트와 펜이 있는 구도
                  - 자연광이 들어오는 데스크 환경
                  - 학습하는 분위기 전달

                  검색 키워드: "online learning laptop", "studying with laptop notes"
                  추천 소스: Unsplash, Pexels
                */}
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/50">
                  Hero Image
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lecture Input Section */}
        <section className="py-16 border-t border-border">
          <div className="max-w-2xl mx-auto px-6">
            <div className="animate-fade-in">
              {isCreating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-4" />
                  <p className="text-muted-foreground">과제 세션을 생성하는 중...</p>
                </div>
              ) : (
                <LectureInput onAnalyzeComplete={handleAnalyzeComplete} />
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                이용 방법
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight">
                3단계로 완성하는 실습
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center animate-fade-in animate-delay-100">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  {/*
                    권장 이미지: YouTube 강의 화면
                    - 모니터에 강의 영상이 재생되는 모습
                    - 코딩 관련 강의 내용이 살짝 보이는 정도

                    검색 키워드: "youtube tutorial screen", "online course monitor"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/50">
                    Step 1 Image
                  </div>
                </div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Step 01
                </p>
                <h3 className="font-serif text-xl font-semibold mb-2">강의 입력</h3>
                <p className="text-sm text-muted-foreground">
                  YouTube URL을 입력하면<br />AI가 내용을 분석합니다
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center animate-fade-in animate-delay-200">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  {/*
                    권장 이미지: 분석 결과 / 구조화된 정보
                    - 화이트보드에 그린 다이어그램
                    - 노트에 정리된 마인드맵

                    검색 키워드: "whiteboard planning", "structured notes"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/50">
                    Step 2 Image
                  </div>
                </div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Step 02
                </p>
                <h3 className="font-serif text-xl font-semibold mb-2">과제 생성</h3>
                <p className="text-sm text-muted-foreground">
                  핵심 역량 기반<br />맞춤형 과제가 생성됩니다
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center animate-fade-in animate-delay-300">
                <div className="aspect-[4/3] bg-muted rounded-sm mb-6 relative overflow-hidden mx-auto max-w-xs">
                  {/*
                    권장 이미지: 코드 리뷰 / 피드백
                    - 코드 에디터에서 리뷰하는 모습
                    - pair programming 느낌

                    검색 키워드: "code review screen", "developer feedback"
                  */}
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/50">
                    Step 3 Image
                  </div>
                </div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Step 03
                </p>
                <h3 className="font-serif text-xl font-semibold mb-2">AI 피드백</h3>
                <p className="text-sm text-muted-foreground">
                  시니어 개발자 수준의<br />코드 리뷰를 받습니다
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
