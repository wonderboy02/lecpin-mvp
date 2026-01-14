"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, FileVideo, Sparkles } from "lucide-react"

interface LectureInputProps {
  onAnalyze: () => void
}

export function LectureInput({ onAnalyze }: LectureInputProps) {
  const [inputType, setInputType] = useState<"upload" | "url">("upload")
  const [url, setUrl] = useState("")
  const [fileName, setFileName] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-semibold text-foreground">강의를 실습으로 바꿔보세요</CardTitle>
        <CardDescription className="text-base">
          강의 영상을 업로드하거나 URL을 입력하면 AI가 핵심 역량을 분석하고 맞춤형 실습 과제를 생성합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <Tabs value={inputType} onValueChange={(v) => setInputType(v as "upload" | "url")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              영상 업로드
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="w-4 h-4" />
              URL 입력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <Label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                {fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileVideo className="w-10 h-10 text-primary" />
                    <span className="text-sm font-medium text-foreground">{fileName}</span>
                    <span className="text-xs text-muted-foreground">클릭하여 다른 파일 선택</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">강의 영상을 업로드하세요</span>
                    <span className="text-xs text-muted-foreground">MP4, MOV, AVI (최대 500MB)</span>
                  </div>
                )}
                <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="lecture-url" className="text-sm font-medium">
                강의 URL
              </Label>
              <Input
                id="lecture-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... 또는 강의 플랫폼 URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                YouTube, Udemy, Coursera 등 대부분의 강의 플랫폼을 지원합니다
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={onAnalyze}
          disabled={inputType === "upload" ? !fileName : !url}
          className="w-full h-11 text-base font-medium gap-2"
        >
          <Sparkles className="w-4 h-4" />
          강의 분석하기
        </Button>
      </CardContent>
    </Card>
  )
}
