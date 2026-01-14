# 03. API 엔드포인트

## 목차
1. [API 구조 개요](#1-api-구조-개요)
2. [인증 API](#2-인증-api)
3. [강의 분석 API](#3-강의-분석-api)
4. [과제 생성 API](#4-과제-생성-api)
5. [코드 제출 API](#5-코드-제출-api)
6. [피드백 API](#6-피드백-api)

---

## 1. API 구조 개요

### 디렉토리 구조

```
src/app/api/
├── auth/
│   └── callback/
│       └── route.ts          # GitHub OAuth 콜백
├── lectures/
│   ├── analyze/
│   │   └── route.ts          # 강의 분석 (자막 추출 + AI 분석)
│   └── [id]/
│       └── route.ts          # 강의 상세 조회
├── tasks/
│   ├── generate/
│   │   └── route.ts          # 과제 생성
│   └── create-repo/
│       └── route.ts          # GitHub Repo 생성
├── submissions/
│   ├── upload/
│   │   └── route.ts          # ZIP 파일 업로드
│   └── github/
│       └── route.ts          # GitHub Repo URL 제출
└── feedback/
    └── generate/
        └── route.ts          # AI 피드백 생성
```

### 공통 응답 형식

```typescript
// 성공
{
  success: true,
  data: { ... }
}

// 에러
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message"
  }
}
```

### 공통 에러 코드

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

---

## 2. 인증 API

### 2.1 GitHub 로그인 시작

클라이언트에서 직접 Supabase SDK 호출:

```typescript
// src/lib/auth.ts
export async function signInWithGitHub() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo read:user user:email',
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  return { data, error }
}
```

### 2.2 OAuth Callback

**`GET /api/auth/callback`**

GitHub OAuth 인증 후 콜백 처리. Code를 Session으로 교환하고 provider_token 저장.

```typescript
// src/app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Code → Session 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // GitHub provider_token 저장
      const providerToken = data.session.provider_token
      const user = data.session.user
      
      // users 테이블에 GitHub 정보 저장/업데이트
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata.full_name,
        avatar_url: user.user_metadata.avatar_url,
        github_username: user.user_metadata.user_name,
        github_token: providerToken  // GitHub API 호출용
      })
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

### 2.3 로그아웃

```typescript
// 클라이언트
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
```

---

## 3. 강의 분석 API

### 3.1 강의 분석 요청

**`POST /api/lectures/analyze`**

YouTube URL을 받아 자막 추출 → AI 분석 → 역량 추출

**Request:**
```typescript
{
  youtube_url: string  // "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    lecture: {
      id: string,
      title: string,
      youtube_url: string,
      youtube_id: string,
      thumbnail_url: string,
      duration_seconds: number,
      transcript: string,
      language: string,
      status: 'completed'
    },
    competencies: [
      {
        id: string,
        name: string,
        description: string,
        order_index: number
      }
    ]
  }
}
```

**구현 플로우:**

```typescript
// src/app/api/lectures/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeInfo } from '@/lib/youtube'
import { extractTranscript } from '@/lib/yt-dlp'
import { analyzeCompetencies } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // 1. 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' }
    }, { status: 401 })
  }

  // 2. 요청 파싱
  const { youtube_url } = await request.json()
  
  // 3. YouTube 정보 추출
  const youtubeInfo = await extractYouTubeInfo(youtube_url)
  // { id, title, thumbnail_url, duration_seconds }

  // 4. 강의 레코드 생성 (status: 'extracting')
  const { data: lecture } = await supabase
    .from('lectures')
    .insert({
      user_id: user.id,
      title: youtubeInfo.title,
      youtube_url,
      youtube_id: youtubeInfo.id,
      thumbnail_url: youtubeInfo.thumbnail_url,
      duration_seconds: youtubeInfo.duration_seconds,
      status: 'extracting'
    })
    .select()
    .single()

  // 5. 자막 추출 (yt-dlp)
  const transcript = await extractTranscript(youtube_url)
  
  // 6. 상태 업데이트 (status: 'analyzing')
  await supabase
    .from('lectures')
    .update({ transcript, status: 'analyzing' })
    .eq('id', lecture.id)

  // 7. AI 역량 분석
  const competencies = await analyzeCompetencies(transcript, youtubeInfo.title)

  // 8. 역량 저장
  await supabase.from('competencies').insert(
    competencies.map((c, i) => ({
      lecture_id: lecture.id,
      name: c.name,
      description: c.description,
      order_index: i
    }))
  )

  // 9. 상태 업데이트 (status: 'completed')
  const { data: finalLecture } = await supabase
    .from('lectures')
    .update({ status: 'completed' })
    .eq('id', lecture.id)
    .select()
    .single()

  // 10. 역량 조회
  const { data: savedCompetencies } = await supabase
    .from('competencies')
    .select('*')
    .eq('lecture_id', lecture.id)
    .order('order_index')

  return NextResponse.json({
    success: true,
    data: {
      lecture: finalLecture,
      competencies: savedCompetencies
    }
  })
}
```

### 3.2 YouTube 정보 추출 유틸

```typescript
// src/lib/youtube.ts
export async function extractYouTubeInfo(url: string) {
  // YouTube URL에서 video ID 추출
  const videoId = extractVideoId(url)
  
  // YouTube oEmbed API로 정보 가져오기 (API key 불필요)
  const response = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  )
  const data = await response.json()
  
  return {
    id: videoId,
    title: data.title,
    thumbnail_url: data.thumbnail_url,
    duration_seconds: null // oEmbed에서는 duration 제공 안함
  }
}

function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  if (!match) throw new Error('Invalid YouTube URL')
  return match[1]
}
```

### 3.3 yt-dlp 자막 추출 유틸

```typescript
// src/lib/yt-dlp.ts
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function extractTranscript(youtubeUrl: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yt-'))
  const outputPath = path.join(tempDir, 'subtitle')
  
  try {
    // yt-dlp로 자막 추출 (한국어 우선, 없으면 영어)
    const command = `yt-dlp --write-auto-sub --sub-lang ko,en --skip-download --convert-subs srt -o "${outputPath}" "${youtubeUrl}"`
    
    await execAsync(command)
    
    // 생성된 자막 파일 찾기
    const files = await fs.readdir(tempDir)
    const srtFile = files.find(f => f.endsWith('.srt'))
    
    if (!srtFile) {
      throw new Error('자막을 찾을 수 없습니다')
    }
    
    // SRT 파일 읽고 텍스트만 추출
    const srtContent = await fs.readFile(path.join(tempDir, srtFile), 'utf-8')
    const transcript = parseSRT(srtContent)
    
    return transcript
  } finally {
    // 임시 파일 정리
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

function parseSRT(srt: string): string {
  // SRT 포맷에서 텍스트만 추출
  const lines = srt.split('\n')
  const textLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    // 숫자(인덱스)와 타임스탬프 라인 건너뛰기
    if (/^\d+$/.test(line)) continue
    if (/^\d{2}:\d{2}:\d{2}/.test(line)) continue
    if (line === '') continue
    // HTML 태그 제거
    textLines.push(line.replace(/<[^>]*>/g, ''))
  }
  
  return textLines.join(' ')
}
```

---

## 4. 과제 생성 API

### 4.1 과제 생성

**`POST /api/tasks/generate`**

**Request:**
```typescript
{
  lecture_id: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    task: {
      id: string,
      title: string,
      description: string,
      reason: string,
      estimated_time: string,
      difficulty: 'beginner' | 'intermediate' | 'advanced',
      tech_stack: string[],
      steps: { order: number, content: string }[],
      success_criteria: string[],
      github_repo_url: string | null
    }
  }
}
```

**구현:**

```typescript
// src/app/api/tasks/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTask } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' }
    }, { status: 401 })
  }

  const { lecture_id } = await request.json()
  
  // 강의 및 역량 조회
  const { data: lecture } = await supabase
    .from('lectures')
    .select('*, competencies(*)')
    .eq('id', lecture_id)
    .single()
  
  if (!lecture || lecture.user_id !== user.id) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'NOT_FOUND', message: '강의를 찾을 수 없습니다' }
    }, { status: 404 })
  }

  // AI로 과제 생성
  const taskData = await generateTask(
    lecture.title,
    lecture.transcript,
    lecture.competencies
  )

  // DB 저장
  const { data: task } = await supabase
    .from('tasks')
    .insert({
      lecture_id,
      ...taskData
    })
    .select()
    .single()

  return NextResponse.json({
    success: true,
    data: { task }
  })
}
```

### 4.2 GitHub Repo 생성

**`POST /api/tasks/create-repo`**

Template Repository에서 사용자 계정에 새 Repo 생성

**Request:**
```typescript
{
  task_id: string,
  repo_name: string  // 사용자가 원하는 repo 이름
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    repo_url: string,  // "https://github.com/username/repo-name"
    clone_url: string  // "https://github.com/username/repo-name.git"
  }
}
```

**구현:**

```typescript
// src/app/api/tasks/create-repo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' }
    }, { status: 401 })
  }

  const { task_id, repo_name } = await request.json()

  // 사용자의 GitHub token 조회
  const { data: userData } = await supabase
    .from('users')
    .select('github_token, github_username')
    .eq('id', user.id)
    .single()

  if (!userData?.github_token) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'FORBIDDEN', message: 'GitHub 연동이 필요합니다' }
    }, { status: 403 })
  }

  // Template에서 Repo 생성
  const templateOwner = process.env.GITHUB_TEMPLATE_OWNER!
  const templateRepo = process.env.GITHUB_TEMPLATE_REPO!

  const response = await fetch(
    `https://api.github.com/repos/${templateOwner}/${templateRepo}/generate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userData.github_token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        owner: userData.github_username,
        name: repo_name,
        description: 'Lecpin 실습 과제',
        private: false
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json({ 
      success: false, 
      error: { 
        code: 'GITHUB_ERROR', 
        message: error.message || 'Repository 생성 실패' 
      }
    }, { status: response.status })
  }

  const repoData = await response.json()

  // Task에 repo URL 저장
  await supabase
    .from('tasks')
    .update({ github_repo_url: repoData.html_url })
    .eq('id', task_id)

  return NextResponse.json({
    success: true,
    data: {
      repo_url: repoData.html_url,
      clone_url: repoData.clone_url
    }
  })
}
```

---

## 5. 코드 제출 API

### 5.1 GitHub Repo URL 제출

**`POST /api/submissions/github`**

**Request:**
```typescript
{
  task_id: string,
  github_repo_url: string,  // 사용자의 GitHub repo URL
  description?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    submission: {
      id: string,
      task_id: string,
      submission_type: 'github',
      github_repo_url: string,
      status: 'pending'
    }
  }
}
```

### 5.2 ZIP 파일 업로드

**`POST /api/submissions/upload`**

**Request:** `multipart/form-data`
```
task_id: string
file: File (ZIP)
description?: string
```

**Response:**
```typescript
{
  success: true,
  data: {
    submission: {
      id: string,
      task_id: string,
      submission_type: 'upload',
      file_path: string,
      status: 'pending'
    }
  }
}
```

**구현:**

```typescript
// src/app/api/submissions/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' }
    }, { status: 401 })
  }

  const formData = await request.formData()
  const taskId = formData.get('task_id') as string
  const file = formData.get('file') as File
  const description = formData.get('description') as string | null

  // 파일 검증
  if (!file || !file.name.endsWith('.zip')) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: 'ZIP 파일만 업로드 가능합니다' }
    }, { status: 400 })
  }

  // Supabase Storage에 업로드
  const filePath = `${user.id}/${taskId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('submissions')
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'UPLOAD_ERROR', message: uploadError.message }
    }, { status: 500 })
  }

  // Submission 레코드 생성
  const { data: submission } = await supabase
    .from('submissions')
    .insert({
      task_id: taskId,
      user_id: user.id,
      submission_type: 'upload',
      file_path: filePath,
      description,
      status: 'pending'
    })
    .select()
    .single()

  return NextResponse.json({
    success: true,
    data: { submission }
  })
}
```

---

## 6. 피드백 API

### 6.1 AI 피드백 생성

**`POST /api/feedback/generate`**

**Request:**
```typescript
{
  submission_id: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    feedback: {
      id: string,
      submission_id: string,
      overall_score: number,
      grade: 'Poor' | 'Fair' | 'Good' | 'Excellent',
      summary: string,
      code_quality: {
        readability: number,
        maintainability: number,
        performance: number,
        typescript: number
      },
      strengths: [...],
      improvements: [...],
      next_steps: string[]
    }
  }
}
```

**구현:**

```typescript
// src/app/api/feedback/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchGitHubCode } from '@/lib/github'
import { extractZipCode } from '@/lib/zip'
import { generateCodeReview } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' }
    }, { status: 401 })
  }

  const { submission_id } = await request.json()

  // Submission 조회
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, tasks(*, lectures(*))')
    .eq('id', submission_id)
    .single()

  if (!submission || submission.user_id !== user.id) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'NOT_FOUND', message: '제출을 찾을 수 없습니다' }
    }, { status: 404 })
  }

  // 상태 업데이트
  await supabase
    .from('submissions')
    .update({ status: 'reviewing' })
    .eq('id', submission_id)

  // 코드 추출
  let codeFiles: { path: string, content: string }[]
  
  if (submission.submission_type === 'github') {
    // GitHub에서 코드 가져오기
    const { data: userData } = await supabase
      .from('users')
      .select('github_token')
      .eq('id', user.id)
      .single()
    
    codeFiles = await fetchGitHubCode(
      submission.github_repo_url!,
      userData!.github_token!
    )
  } else {
    // ZIP 파일에서 코드 추출
    const { data: fileData } = await supabase.storage
      .from('submissions')
      .download(submission.file_path!)
    
    codeFiles = await extractZipCode(fileData!)
  }

  // AI 코드 리뷰
  const task = submission.tasks
  const reviewResult = await generateCodeReview(
    codeFiles,
    task.title,
    task.success_criteria
  )

  // Feedback 저장
  const { data: feedback } = await supabase
    .from('feedbacks')
    .insert({
      submission_id,
      ...reviewResult
    })
    .select()
    .single()

  // Submission 상태 완료로 변경
  await supabase
    .from('submissions')
    .update({ status: 'completed' })
    .eq('id', submission_id)

  return NextResponse.json({
    success: true,
    data: { feedback }
  })
}
```

---

## API 테스트 체크리스트

- [ ] `POST /api/auth/callback` - GitHub OAuth 콜백
- [ ] `POST /api/lectures/analyze` - 강의 분석
- [ ] `POST /api/tasks/generate` - 과제 생성
- [ ] `POST /api/tasks/create-repo` - GitHub Repo 생성
- [ ] `POST /api/submissions/github` - GitHub 제출
- [ ] `POST /api/submissions/upload` - ZIP 업로드
- [ ] `POST /api/feedback/generate` - 피드백 생성
