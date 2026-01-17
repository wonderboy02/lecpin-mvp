"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OnboardingDashboard } from "./_components/onboarding-dashboard"
import { OnboardingTour } from "./_components/onboarding-tour"

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoggedIn } = useUser()

  const handleComplete = async () => {
    if (isLoggedIn) {
      try {
        await fetch('/api/users/onboarding', { method: 'POST' })
      } catch (error) {
        console.error('Failed to save onboarding:', error)
      }
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <OnboardingDashboard />
      </main>
      <Footer />
      <OnboardingTour onComplete={handleComplete} />
    </div>
  )
}
