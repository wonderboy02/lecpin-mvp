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
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            강의를 실습으로 바꿔보세요
          </h1>
          <p className="text-muted-foreground">
            YouTube 강의 URL을 입력하면 AI가 맞춤형 실습 과제를 생성해드립니다
          </p>
        </div>

        {/* Quick Access */}
        {isLoggedIn && (
          <div className="mb-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              내 학습 대시보드 &rarr;
            </Button>
          </div>
        )}

        {/* Lecture Input */}
        <div className="animate-fade-in">
          {isCreating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">과제 세션을 생성하는 중...</p>
            </div>
          ) : (
            <LectureInput onAnalyzeComplete={handleAnalyzeComplete} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
