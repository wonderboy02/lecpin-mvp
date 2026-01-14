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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[
              { key: "input", label: "강의 입력" },
              { key: "summary", label: "역량 분석" },
              { key: "task", label: "실습 과제" },
              { key: "submit", label: "결과 제출" },
              { key: "feedback", label: "AI 피드백" },
            ].map((step, index, arr) => (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currentStep === step.key
                      ? "bg-primary text-primary-foreground"
                      : arr.findIndex((s) => s.key === currentStep) > index
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {index < arr.length - 1 && <div className="w-6 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        </div>

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
      </main>
      <Footer />
    </div>
  )
}
