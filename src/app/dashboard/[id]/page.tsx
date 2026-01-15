"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StepNavigation } from "@/components/step-navigation"
import { CompetencySummary } from "@/components/competency-summary"
import { PracticalTask } from "@/components/practical-task"
import { SubmissionUpload } from "@/components/submission-upload"
import { AIFeedback } from "@/components/ai-feedback"
import { Button } from "@/components/ui/button"
import type { UserTaskWithRelations, Step, Task, Submission, Feedback, LectureWithCompetencies, SubmissionWithFeedback } from "@/types"

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isLoggedIn, loading: authLoading } = useUser()

  const [userTask, setUserTask] = useState<UserTaskWithRelations | null>(null)
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionWithFeedback[]>([])
  const [loading, setLoading] = useState(true)

  const userTaskId = params.id as string

  const fetchUserTask = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/user-tasks/${userTaskId}`)
      const data = await res.json()
      if (data.userTask) {
        setUserTask(data.userTask)
        // submission history도 저장
        if (data.submissionHistory) {
          setSubmissionHistory(data.submissionHistory)
        }
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Fetch user task error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [userTaskId, router])

  // 데이터 로드
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
      return
    }

    if (isLoggedIn && userTaskId) {
      fetchUserTask()
    }
  }, [authLoading, isLoggedIn, userTaskId, router, fetchUserTask])

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
    // history에 새 submission 추가 (피드백은 아직 없음)
    setSubmissionHistory(prev => [{ ...submission, feedback: null }, ...prev])
    updateStep('feedback', { submission_id: submission.id })
  }

  // 재제출 핸들러
  const handleResubmit = () => {
    updateStep('submit')
  }

  const handleFeedbackGenerated = (feedback: Feedback) => {
    setUserTask(prev => prev ? { ...prev, feedback, feedback_id: feedback.id } : null)
    // history에서 해당 submission의 feedback 업데이트
    setSubmissionHistory(prev =>
      prev.map(s =>
        s.id === feedback.submission_id ? { ...s, feedback } : s
      )
    )
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

  // lecture에 competencies가 있는지 확인
  const lectureWithCompetencies: LectureWithCompetencies = {
    ...lecture,
    competencies: lecture.competencies || []
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {/* 대시보드로 돌아가기 */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => router.push('/dashboard')}
        >
          &larr; 대시보드로 돌아가기
        </Button>

        {/* StepNavigation 컴포넌트 */}
        <StepNavigation
          currentStep={current_step}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* 단계별 컨텐츠 */}
        <div className="animate-fade-in mt-8">
          {current_step === 'summary' && lecture && (
            <CompetencySummary
              lecture={lectureWithCompetencies}
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
              submissionHistory={submissionHistory}
              onFeedbackGenerated={handleFeedbackGenerated}
              onResubmit={handleResubmit}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
