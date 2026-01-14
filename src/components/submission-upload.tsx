"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileArchive, X, Send, AlertCircle, Github, Loader2, Upload } from "lucide-react"
import type { Task, Submission } from "@/types"

interface SubmissionUploadProps {
  task: Task
  onSubmissionComplete: (submission: Submission) => void
}

export function SubmissionUpload({ task, onSubmissionComplete }: SubmissionUploadProps) {
  const [submitType, setSubmitType] = useState<"github" | "upload">("github")
  const [githubUrl, setGithubUrl] = useState(task.github_repo_url || "")
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList && fileList[0]) {
      const f = fileList[0]
      if (f.name.endsWith(".zip")) {
        setFile(f)
        setError(null)
      } else {
        setError("ZIP 파일만 업로드 가능합니다.")
      }
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      let response: Response

      if (submitType === "github") {
        if (!githubUrl) {
          throw new Error("GitHub 저장소 URL을 입력해주세요.")
        }

        response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: task.id,
            github_repo_url: githubUrl,
            description,
          }),
        })
      } else {
        if (!file) {
          throw new Error("ZIP 파일을 업로드해주세요.")
        }

        const formData = new FormData()
        formData.append("task_id", task.id)
        formData.append("file", file)
        if (description) {
          formData.append("description", description)
        }

        response = await fetch("/api/submissions/upload", {
          method: "POST",
          body: formData,
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "제출에 실패했습니다.")
      }

      onSubmissionComplete(data.submission)
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubmitDisabled = submitType === "github" ? !githubUrl : !file

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-semibold text-foreground">코드 제출</CardTitle>
        <CardDescription>
          완성한 코드를 제출하면 시니어 개발자 수준의 AI 코드 리뷰를 받을 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <Tabs value={submitType} onValueChange={(v) => setSubmitType(v as "github" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="github" className="gap-2">
              <Github className="w-4 h-4" />
              GitHub 저장소
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              ZIP 업로드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="github-url" className="text-sm font-medium">
                GitHub 저장소 URL
              </Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value)
                  setError(null)
                }}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                실습 코드가 있는 GitHub 저장소 URL을 입력해주세요
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">프로젝트 ZIP 파일 업로드</Label>
              <label
                htmlFor="code-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <FileArchive className="w-10 h-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium text-foreground">클릭하여 ZIP 파일 업로드</span>
                <span className="text-xs text-muted-foreground mt-1">프로젝트 폴더를 압축한 .zip 파일 (최대 50MB)</span>
                <input
                  id="code-upload"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>

              {file && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <FileArchive className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile} className="h-7 w-7 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">업로드 전 확인사항</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>node_modules 폴더는 제외하고 압축해주세요</li>
                    <li>프로젝트 루트 폴더를 압축해주세요</li>
                    <li>package.json이 포함되어 있는지 확인해주세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            추가 설명 (선택)
          </Label>
          <Textarea
            id="description"
            placeholder="구현하면서 어려웠던 점, 고민했던 부분, 특별히 리뷰받고 싶은 코드 등을 작성해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none font-mono text-sm"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled || isSubmitting}
          className="w-full h-11 text-base font-medium gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              제출 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              코드 제출하고 리뷰 받기
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
