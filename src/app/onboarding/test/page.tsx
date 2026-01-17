"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OnboardingDashboard } from "../_components/onboarding-dashboard"
import { OnboardingTour } from "../_components/onboarding-tour"

export default function OnboardingTestPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Test Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-center">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          🧪 테스트 모드 - 온보딩 완료 처리되지 않습니다
        </p>
      </div>
      <Header />
      <main className="flex-1">
        <OnboardingDashboard />
      </main>
      <Footer />
      <OnboardingTour onComplete={handleComplete} />
    </div>
  )
}
