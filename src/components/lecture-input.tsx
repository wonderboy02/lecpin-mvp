"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/hooks/use-user"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import type { LectureWithCompetencies } from "@/types"

interface LectureInputProps {
  onAnalyzeComplete: (lecture: LectureWithCompetencies) => void
}

export function LectureInput({ onAnalyzeComplete }: LectureInputProps) {
  const { isLoggedIn, loading: userLoading } = useUser()
  const { language } = useLanguage()
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValidYoutubeUrl = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const handleAnalyze = async () => {
    if (!url || !isValidYoutubeUrl(url)) {
      setError("유효한 YouTube URL을 입력해주세요.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/lectures/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url, language }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "분석에 실패했습니다.")
      }

      onAnalyzeComplete(data.lecture)
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (userLoading) {
    return (
      <Card className="border-border/60 shadow-subtle">
        <CardContent className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            강의 분석 시작하기
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고
            맞춤형 실습 과제를 생성합니다
          </p>
        </div>

        {!isLoggedIn ? (
          /* Login Required State */
          <div className="text-center py-8">
            <div className="mb-8">
              <div className="aspect-video max-w-xs mx-auto bg-muted rounded-sm mb-6 relative overflow-hidden">
                {/*
                  권장 이미지: 로그인 유도 이미지
                  - 깔끔한 빈 데스크 또는 시작하는 느낌
                  - GitHub 로고가 살짝 보여도 좋음
                */}
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-sm text-muted-foreground">
                강의 분석 및 실습 과제를 생성하려면<br />
                GitHub로 로그인해주세요.
              </p>
            </div>
            <Button asChild className="h-11 px-8">
              <Link href="/login">GitHub로 시작하기</Link>
            </Button>
          </div>
        ) : (
          /* URL Input Form */
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
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                className="h-12 text-base"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                자막이 있는 YouTube 강의 영상을 지원합니다
              </p>
            </div>

            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                {error}
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!url || isAnalyzing}
              className="w-full h-12 text-base font-medium"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  분석 중...
                </span>
              ) : (
                "강의 분석하기"
              )}
            </Button>

            {isAnalyzing && (
              <p className="text-center text-sm text-muted-foreground">
                자막을 추출하고 AI가 분석 중입니다. 1-2분 정도 소요됩니다.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
