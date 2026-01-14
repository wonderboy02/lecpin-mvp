"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Youtube, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import Link from "next/link"
import type { LectureWithCompetencies } from "@/types"

interface LectureInputProps {
  onAnalyzeComplete: (lecture: LectureWithCompetencies) => void
}

export function LectureInput({ onAnalyzeComplete }: LectureInputProps) {
  const { isLoggedIn, loading: userLoading } = useUser()
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
        body: JSON.stringify({ youtube_url: url }),
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
      <Card className="shadow-sm border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-semibold text-foreground">
          강의를 실습으로 바꿔보세요
        </CardTitle>
        <CardDescription className="text-base">
          YouTube 강의 URL을 입력하면 AI가 핵심 역량을 분석하고 맞춤형 실습 과제를 생성합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {!isLoggedIn ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Youtube className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">로그인이 필요합니다</h3>
              <p className="text-sm text-muted-foreground">
                강의 분석 및 실습 과제를 생성하려면 GitHub로 로그인해주세요.
              </p>
            </div>
            <Button asChild>
              <Link href="/login">GitHub로 로그인</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label htmlFor="youtube-url" className="text-sm font-medium">
                YouTube 강의 URL
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setError(null)
                    }}
                    className="pl-10"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                자막이 있는 YouTube 강의 영상을 지원합니다
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!url || isAnalyzing}
              className="w-full h-11 text-base font-medium gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  강의 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  강의 분석하기
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="text-center text-sm text-muted-foreground">
                <p>자막을 추출하고 AI가 분석 중입니다.</p>
                <p>영상 길이에 따라 1-2분 정도 소요될 수 있습니다.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
