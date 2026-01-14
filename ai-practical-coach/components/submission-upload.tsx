"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileArchive, X, Send, AlertCircle } from "lucide-react"

interface SubmissionUploadProps {
  onSubmit: () => void
}

export function SubmissionUpload({ onSubmit }: SubmissionUploadProps) {
  const [file, setFile] = useState<string | null>(null)
  const [description, setDescription] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList && fileList[0]) {
      const f = fileList[0]
      // ZIP 파일만 허용
      if (f.name.endsWith(".zip")) {
        setFile(f.name)
      } else {
        alert("ZIP 파일만 업로드 가능합니다.")
      }
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-semibold text-foreground">코드 제출</CardTitle>
        <CardDescription>
          완성한 코드를 ZIP 파일로 압축하여 업로드하면 시니어 개발자 수준의 코드 리뷰를 받을 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">프로젝트 ZIP 파일 업로드</Label>
          <label
            htmlFor="code-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            <FileArchive className="w-10 h-10 text-muted-foreground mb-3" />
            <span className="text-sm font-medium text-foreground">클릭하여 ZIP 파일 업로드</span>
            <span className="text-xs text-muted-foreground mt-1">프로젝트 폴더를 압축한 .zip 파일</span>
            <input id="code-upload" type="file" accept=".zip" className="hidden" onChange={handleFileChange} />
          </label>

          {file && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <FileArchive className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{file}</span>
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
          />
        </div>

        <Button onClick={onSubmit} disabled={!file} className="w-full h-11 text-base font-medium gap-2">
          <Send className="w-4 h-4" />
          코드 제출하고 리뷰 받기
        </Button>
      </CardContent>
    </Card>
  )
}
