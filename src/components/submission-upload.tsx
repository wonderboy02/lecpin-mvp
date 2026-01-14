"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task, Submission } from "@/types"

interface SubmissionUploadProps {
  task: Task
  onSubmissionComplete: (submission: Submission) => void
}

export function SubmissionUpload({ task, onSubmissionComplete }: SubmissionUploadProps) {
  const hasLinkedRepo = !!task.github_repo_url
  const [submitType, setSubmitType] = useState<"github" | "upload">("github")
  const [githubUrl, setGithubUrl] = useState("")
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
        // 연결된 레포가 없고 URL도 입력 안 했으면 에러
        if (!hasLinkedRepo && !githubUrl) {
          throw new Error("GitHub 저장소 URL을 입력해주세요.")
        }

        response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: task.id,
            // 연결된 레포가 있으면 URL 생략 (서버에서 자동 사용)
            ...(hasLinkedRepo ? {} : { github_repo_url: githubUrl }),
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

  // 연결된 레포가 있으면 URL 입력 없이 제출 가능
  const isSubmitDisabled = submitType === "github" ? (!hasLinkedRepo && !githubUrl) : !file

  return (
    <Card className="border-border/60 shadow-subtle">
      <CardContent className="p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            코드 제출
          </h2>
          <p className="text-muted-foreground">
            완성한 코드를 제출하면 시니어 개발자 수준의 AI 코드 리뷰를 받을 수 있습니다
          </p>
        </div>

        <div className="space-y-6">
          <Tabs value={submitType} onValueChange={(v) => setSubmitType(v as "github" | "upload")}>
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="github" className="text-sm">
                GitHub 저장소
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-sm">
                ZIP 업로드
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github" className="space-y-4 mt-6">
              {hasLinkedRepo ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-md bg-secondary/50 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-foreground">연결된 저장소</span>
                    </div>
                    <a
                      href={task.github_repo_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {task.github_repo_url}
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    저장소에 코드를 푸시한 후 제출 버튼을 눌러주세요
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
                    className="h-11"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    실습 코드가 있는 GitHub 저장소 URL을 입력해주세요
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">프로젝트 ZIP 파일</Label>
                <label
                  htmlFor="code-upload"
                  className="flex flex-col items-center justify-center w-full h-36 border border-dashed border-border rounded-md cursor-pointer hover:border-foreground/30 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground mb-1">
                    클릭하여 ZIP 파일 업로드
                  </span>
                  <span className="text-xs text-muted-foreground">
                    프로젝트 폴더를 압축한 .zip 파일 (최대 50MB)
                  </span>
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
                  <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      x
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-md bg-muted/30 border border-border/40">
                <p className="text-sm font-medium text-foreground mb-2">업로드 전 확인사항</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>node_modules 폴더는 제외하고 압축해주세요</li>
                  <li>프로젝트 루트 폴더를 압축해주세요</li>
                  <li>package.json이 포함되어 있는지 확인해주세요</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              추가 설명 <span className="text-muted-foreground font-normal">(선택)</span>
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

          {/* Error */}
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled || isSubmitting}
            className="w-full h-12 text-base font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                제출 중...
              </span>
            ) : (
              "코드 제출하고 리뷰 받기"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
