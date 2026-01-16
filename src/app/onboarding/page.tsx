"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

// 목업 데이터
const MOCK_DATA = {
  url: "https://www.youtube.com/watch?v=r4-cftqTcdI",
  title: "5. Dynamic Programming, Part 1: SRTBOT, Fib, DAGs, Bowling",
  course: "MIT 6.006 Introduction to Algorithms, Spring 2020",
  competencies: [
    {
      title: "동적 프로그래밍 기본 개념 (SRTBOT 원칙)",
      description: "Subproblems, Relate, Topological order, Base case, Original problem, Time analysis"
    },
    {
      title: "Memoization과 Tabulation 기법",
      description: "Top-down과 Bottom-up 접근 방식의 이해 및 구현"
    }
  ],
  task: {
    title: "볼링 점수 계산 시스템 구현",
    description: "동적 프로그래밍을 활용하여 볼링 게임의 점수를 계산하는 시스템을 구현하세요.",
  },
  feedback: {
    positive: [
      "동적 프로그래밍 접근 방식이 올바릅니다",
      "부분문제를 명확하게 정의했습니다"
    ],
    improvements: [
      "O(n²) 시간복잡도를 O(n)으로 개선 가능합니다",
      "Memoization 대신 Tabulation 사용 권장"
    ]
  }
}

type MockupState = 'input' | 'result' | 'feedback'

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [mockupState, setMockupState] = useState<MockupState>('input')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour()
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const startTour = () => {
    const driverObj = driver({
      showProgress: false,
      showButtons: [],
      allowClose: false,
      onHighlighted: () => {
        // 화면 아무 곳이나 클릭 시 다음 단계로 이동
        const clickHandler = () => {
          if (driverObj.hasNextStep()) {
            driverObj.moveNext()
          } else {
            driverObj.destroy()
            completeOnboarding()
          }
          document.removeEventListener('click', clickHandler)
        }

        // 약간의 딜레이 후 이벤트 리스너 추가 (현재 클릭 이벤트와 충돌 방지)
        setTimeout(() => {
          document.addEventListener('click', clickHandler)
        }, 100)
      },
      steps: [
        {
          element: '#lecture-input-card',
          popover: {
            title: '1. 강의 URL 입력',
            description: '여기에 YouTube 강의 URL을 입력하세요. 아무 곳이나 클릭해서 다음 →',
            side: 'bottom',
            align: 'center'
          },
          onHighlighted: () => {
            setMockupState('input')
            setUrl(MOCK_DATA.url)
          }
        },
        {
          element: '#analyze-result',
          popover: {
            title: '2. 분석 결과 확인',
            description: 'AI가 분석한 핵심 역량과 맞춤형 실습 과제가 생성됩니다. 아무 곳이나 클릭 →',
            side: 'top',
            align: 'center'
          },
          onHighlighted: () => {
            setMockupState('result')
          }
        },
        {
          element: '#feedback-section',
          popover: {
            title: '3. AI 피드백',
            description: '코드를 제출하면 시니어 개발자 수준의 피드백을 받습니다. 클릭해서 시작하기 →',
            side: 'top',
            align: 'center'
          },
          onHighlighted: () => {
            setMockupState('feedback')
          }
        }
      ]
    })

    driverObj.drive()
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

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">
              내 학습
            </h1>
            <p className="text-muted-foreground">
              새 강의를 입력하거나 진행 중인 실습 과제를 관리하세요
            </p>
          </div>

          {/* Lecture Input Section */}
          {mockupState === 'input' && (
            <div id="lecture-input-card" className="mb-12">
              <Card className="border-border/60">
                <CardContent className="p-8 sm:p-10">
                  <div className="text-center mb-10">
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
                      강의 분석 시작하기
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고
                      맞춤형 실습 과제를 생성합니다
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="youtube-url" className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                        강의 URL
                      </Label>
                      <Input
                        id="youtube-url"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        자막이 있는 YouTube 강의 영상을 지원합니다
                      </p>
                    </div>

                    <Button className="w-full h-12 text-base font-medium">
                      강의 분석하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis Result */}
          {mockupState === 'result' && (
            <div id="analyze-result" className="space-y-6">
              {/* 강의 정보 */}
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-40 h-24 bg-muted rounded flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                      썸네일
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg mb-1">{MOCK_DATA.title}</h2>
                      <p className="text-sm text-muted-foreground">{MOCK_DATA.course}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 역량 분석 */}
              <div>
                <h3 className="font-semibold text-lg mb-4">분석된 핵심 역량</h3>
                <div className="grid gap-3">
                  {MOCK_DATA.competencies.map((comp, idx) => (
                    <Card key={idx} className="border-border/60">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-1">{comp.title}</h4>
                        <p className="text-sm text-muted-foreground">{comp.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 실습 과제 */}
              <div>
                <h3 className="font-semibold text-lg mb-4">실습 과제</h3>
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-base mb-3">{MOCK_DATA.task.title}</h4>
                    <p className="text-sm text-muted-foreground">{MOCK_DATA.task.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* 제출 영역 */}
              <div>
                <h3 className="font-semibold text-lg mb-4">코드 제출</h3>
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <Textarea
                      placeholder="코드를 입력하거나 파일을 업로드하세요..."
                      className="min-h-[120px] font-mono text-sm mb-4"
                    />
                    <Button className="w-full">제출하기</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Feedback */}
          {mockupState === 'feedback' && (
            <div id="feedback-section" className="space-y-6">
              {/* 강의 정보 */}
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-40 h-24 bg-muted rounded flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                      썸네일
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg mb-1">{MOCK_DATA.title}</h2>
                      <p className="text-sm text-muted-foreground">{MOCK_DATA.course}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold text-lg mb-4">AI 피드백</h3>
                <div className="space-y-4">
                  <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
                    <CardContent className="p-6">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                        <span className="text-lg">✓</span>
                        잘한 점
                      </h4>
                      <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                        {MOCK_DATA.feedback.positive.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                    <CardContent className="p-6">
                      <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                        <span className="text-lg">→</span>
                        개선 제안
                      </h4>
                      <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                        {MOCK_DATA.feedback.improvements.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
