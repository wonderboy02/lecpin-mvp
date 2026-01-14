"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { LectureInput } from "@/components/lecture-input"
import { CompetencySummary } from "@/components/competency-summary"
import { PracticalTask } from "@/components/practical-task"
import { SubmissionUpload } from "@/components/submission-upload"
import { AIFeedback } from "@/components/ai-feedback"
import { Footer } from "@/components/footer"
import type { Step, LectureWithCompetencies, Task, Submission, Feedback } from "@/types"

const steps = [
  { key: "input", label: "강의 입력" },
  { key: "summary", label: "역량 분석" },
  { key: "task", label: "실습 과제" },
  { key: "submit", label: "결과 제출" },
  { key: "feedback", label: "피드백" },
] as const

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("input")
  const [lecture, setLecture] = useState<LectureWithCompetencies | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleAnalyzeComplete = (lectureData: LectureWithCompetencies) => {
    setLecture(lectureData)
    setCurrentStep("summary")
  }

  const handleTaskGenerated = (taskData: Task) => {
    setTask(taskData)
    setCurrentStep("task")
  }

  const handleStartTask = () => {
    setCurrentStep("submit")
  }

  const handleSubmissionComplete = (submissionData: Submission) => {
    setSubmission(submissionData)
    setCurrentStep("feedback")
  }

  const handleFeedbackGenerated = (feedbackData: Feedback) => {
    setFeedback(feedbackData)
  }

  const handleReset = () => {
    setCurrentStep("input")
    setLecture(null)
    setTask(null)
    setSubmission(null)
    setFeedback(null)
  }

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {/* Step Indicator - Minimal Typography Style */}
        <nav className="mb-12" aria-label="Progress">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.key
              const isPast = currentStepIndex > index

              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <span
                      className={`
                        text-xs font-medium tracking-wide uppercase transition-colors duration-300
                        ${isActive ? "text-foreground" : isPast ? "text-muted-foreground" : "text-muted-foreground/50"}
                      `}
                    >
                      {step.label}
                    </span>
                    <div
                      className={`
                        mt-2 h-px transition-all duration-300
                        ${isActive ? "w-full bg-foreground" : isPast ? "w-full bg-muted-foreground/40" : "w-0 bg-transparent"}
                      `}
                      style={{ minWidth: isActive || isPast ? "100%" : 0 }}
                    />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        hidden sm:block w-8 lg:w-12 h-px mx-2 transition-colors duration-300
                        ${isPast ? "bg-muted-foreground/30" : "bg-border/50"}
                      `}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="animate-fade-in">
          {currentStep === "input" && (
            <LectureInput onAnalyzeComplete={handleAnalyzeComplete} />
          )}
          {currentStep === "summary" && lecture && (
            <CompetencySummary
              lecture={lecture}
              onTaskGenerated={handleTaskGenerated}
            />
          )}
          {currentStep === "task" && task && (
            <PracticalTask
              task={task}
              onTaskUpdate={setTask}
              onStart={handleStartTask}
            />
          )}
          {currentStep === "submit" && task && (
            <SubmissionUpload
              task={task}
              onSubmissionComplete={handleSubmissionComplete}
            />
          )}
          {currentStep === "feedback" && submission && (
            <AIFeedback
              submission={submission}
              feedback={feedback}
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
