# 02. Database Schema

## 목차
1. [ERD (Entity Relationship Diagram)](#1-erd)
2. [테이블 상세](#2-테이블-상세)
3. [RLS 정책](#3-rls-정책)
4. [TypeScript 타입](#4-typescript-타입)
5. [Supabase 타입 생성](#5-supabase-타입-생성)

---

## 1. ERD

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ name            │
│ avatar_url      │
│ github_username │
│ github_token    │  ← GitHub API 호출용
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    lectures     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │───────┐
│ title           │       │
│ youtube_url     │       │
│ youtube_id      │       │
│ thumbnail_url   │       │
│ duration_seconds│       │
│ transcript      │       │
│ language        │       │
│ status          │       │
│ created_at      │       │
│ updated_at      │       │
└────────┬────────┘       │
         │                │
    ┌────┴────┐           │
    │ 1:N     │ 1:1       │
    ▼         ▼           │
┌─────────┐ ┌─────────┐   │
│competen-│ │  tasks  │   │
│  cies   │ ├─────────┤   │
├─────────┤ │ id (PK) │   │
│ id (PK) │ │lecture_ │   │
│lecture_ │ │  id(FK) │   │
│  id(FK) │ │ title   │   │
│ name    │ │ desc    │   │
│ desc    │ │ reason  │   │
│ order_  │ │ est_time│   │
│  index  │ │difficulty│  │
│created_ │ │tech_stack│  │
│  at     │ │ steps   │   │
└─────────┘ │success_ │   │
            │ criteria│   │
            │github_  │   │
            │repo_url │   │ ← 생성된 GitHub Repo
            │created_ │   │
            │  at     │   │
            └────┬────┘   │
                 │        │
                 │ 1:N    │
                 ▼        │
         ┌─────────────┐  │
         │ submissions │  │
         ├─────────────┤  │
         │ id (PK)     │  │
         │ task_id(FK) │  │
         │ user_id(FK) │──┘
         │ github_repo │  ← 사용자 GitHub Repo URL
         │ file_path   │  ← 또는 ZIP 파일
         │ description │
         │ status      │
         │ created_at  │
         │ updated_at  │
         └──────┬──────┘
                │
                │ 1:1
                ▼
         ┌─────────────┐
         │  feedbacks  │
         ├─────────────┤
         │ id (PK)     │
         │submission_  │
         │  id (FK)    │
         │overall_score│
         │ grade       │
         │ summary     │
         │code_quality │
         │ strengths   │
         │improvements │
         │ next_steps  │
         │ created_at  │
         └─────────────┘
```

---

## 2. 테이블 상세

### 2.1 users (사용자)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Supabase Auth UID와 동일 |
| email | VARCHAR(255) | NO | - | 이메일 (unique) |
| name | VARCHAR(255) | YES | - | 표시 이름 |
| avatar_url | TEXT | YES | - | 프로필 이미지 |
| github_username | VARCHAR(255) | YES | - | GitHub 유저네임 |
| github_token | TEXT | YES | - | GitHub OAuth Token (암호화 권장) |
| created_at | TIMESTAMPTZ | NO | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 수정일 |

### 2.2 lectures (강의)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | PK |
| user_id | UUID | NO | - | FK → users.id |
| title | VARCHAR(500) | NO | - | 강의 제목 |
| youtube_url | TEXT | NO | - | YouTube 전체 URL |
| youtube_id | VARCHAR(20) | NO | - | YouTube Video ID |
| thumbnail_url | TEXT | YES | - | 썸네일 이미지 |
| duration_seconds | INTEGER | YES | - | 영상 길이 (초) |
| transcript | TEXT | YES | - | 자막 텍스트 |
| language | VARCHAR(100) | YES | - | 프로그래밍 언어 |
| status | VARCHAR(20) | NO | 'pending' | 상태 |
| created_at | TIMESTAMPTZ | NO | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 수정일 |

**status enum:**
- `pending`: 대기 중
- `extracting`: 자막 추출 중
- `analyzing`: AI 분석 중
- `completed`: 완료
- `failed`: 실패

### 2.3 competencies (핵심 역량)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | PK |
| lecture_id | UUID | NO | - | FK → lectures.id |
| name | VARCHAR(255) | NO | - | 역량 이름 |
| description | TEXT | NO | - | 역량 설명 |
| order_index | INTEGER | NO | 0 | 정렬 순서 |
| created_at | TIMESTAMPTZ | NO | NOW() | 생성일 |

### 2.4 tasks (실습 과제)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | PK |
| lecture_id | UUID | NO | - | FK → lectures.id |
| title | VARCHAR(500) | NO | - | 과제 제목 |
| description | TEXT | NO | - | 과제 설명 |
| reason | TEXT | NO | - | 이 과제인 이유 |
| estimated_time | VARCHAR(50) | NO | - | 예상 소요 시간 |
| difficulty | VARCHAR(20) | NO | - | 난이도 |
| tech_stack | TEXT[] | NO | '{}' | 기술 스택 |
| steps | JSONB | NO | '[]' | 단계별 가이드 |
| success_criteria | TEXT[] | NO | '{}' | 성공 기준 |
| github_repo_url | TEXT | YES | - | 생성된 GitHub Repo URL |
| created_at | TIMESTAMPTZ | NO | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 수정일 |

**difficulty enum:**
- `beginner`: 초급
- `intermediate`: 중급
- `advanced`: 고급

**steps JSONB 구조:**
```json
[
  { "order": 1, "content": "첫 번째 단계 설명" },
  { "order": 2, "content": "두 번째 단계 설명" }
]
```

### 2.5 submissions (코드 제출)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | PK |
| task_id | UUID | NO | - | FK → tasks.id |
| user_id | UUID | NO | - | FK → users.id |
| submission_type | VARCHAR(20) | NO | - | 제출 타입 |
| github_repo_url | TEXT | YES | - | GitHub Repo URL |
| file_path | TEXT | YES | - | ZIP 파일 경로 |
| description | TEXT | YES | - | 추가 설명 |
| status | VARCHAR(20) | NO | 'pending' | 상태 |
| created_at | TIMESTAMPTZ | NO | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 수정일 |

**submission_type enum:**
- `github`: GitHub Repo URL 제출
- `upload`: ZIP 파일 업로드

**status enum:**
- `pending`: 대기 중
- `reviewing`: 리뷰 중
- `completed`: 완료
- `failed`: 실패

### 2.6 feedbacks (AI 피드백)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | PK |
| submission_id | UUID | NO | - | FK → submissions.id |
| overall_score | INTEGER | NO | - | 총점 (0-100) |
| grade | VARCHAR(20) | NO | - | 등급 |
| summary | TEXT | NO | - | 요약 |
| code_quality | JSONB | NO | '{}' | 코드 품질 점수 |
| strengths | JSONB | NO | '[]' | 잘한 점 |
| improvements | JSONB | NO | '[]' | 개선점 |
| next_steps | TEXT[] | NO | '{}' | 다음 학습 추천 |
| created_at | TIMESTAMPTZ | NO | NOW() | 생성일 |

**grade enum:**
- `Poor`: 0-39
- `Fair`: 40-59
- `Good`: 60-79
- `Excellent`: 80-100

**code_quality JSONB 구조:**
```json
{
  "readability": 85,
  "maintainability": 80,
  "performance": 78,
  "typescript": 82
}
```

**strengths JSONB 구조:**
```json
[
  {
    "title": "커스텀 훅 분리가 잘 되어 있음",
    "detail": "useTodos, useLocalStorage 훅이...",
    "file": "hooks/useTodos.ts"
  }
]
```

**improvements JSONB 구조:**
```json
[
  {
    "title": "에러 핸들링 부재",
    "detail": "useLocalStorage에서 JSON.parse 실패 시...",
    "file": "hooks/useLocalStorage.ts",
    "severity": "high",
    "suggestion": "try { ... } catch { ... }"
  }
]
```

---

## 3. RLS 정책

### 3.1 users 테이블

```sql
-- 자신의 데이터만 조회
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- 자신의 데이터만 수정
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 신규 가입 시 자신의 row만 생성
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3.2 lectures 테이블

```sql
CREATE POLICY "lectures_select_own" ON lectures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lectures_insert_own" ON lectures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lectures_update_own" ON lectures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "lectures_delete_own" ON lectures
  FOR DELETE USING (auth.uid() = user_id);
```

### 3.3 competencies 테이블

```sql
-- 자신의 강의에 연결된 역량만 조회
CREATE POLICY "competencies_select_own" ON competencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE lectures.id = competencies.lecture_id 
      AND lectures.user_id = auth.uid()
    )
  );

-- INSERT는 service_role만 허용 (API에서 처리)
```

### 3.4 tasks, submissions, feedbacks

동일한 패턴으로 자신의 데이터만 접근 가능하도록 설정.

---

## 4. TypeScript 타입

### 4.1 수동 정의 타입 (src/types/index.ts)

```typescript
// 이 파일은 Supabase 자동 생성 타입을 보완하는 용도

export type LectureStatus = 'pending' | 'extracting' | 'analyzing' | 'completed' | 'failed'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type SubmissionType = 'github' | 'upload'
export type SubmissionStatus = 'pending' | 'reviewing' | 'completed' | 'failed'
export type Grade = 'Poor' | 'Fair' | 'Good' | 'Excellent'

export interface TaskStep {
  order: number
  content: string
}

export interface CodeQuality {
  readability: number
  maintainability: number
  performance: number
  typescript: number
}

export interface StrengthItem {
  title: string
  detail: string
  file: string | null
}

export interface ImprovementItem {
  title: string
  detail: string
  file: string | null
  severity: 'low' | 'medium' | 'high'
  suggestion: string | null
}

// UI 상태
export type Step = 'input' | 'summary' | 'task' | 'submit' | 'feedback'
```

---

## 5. Supabase 타입 생성

### 5.1 package.json 스크립트

```json
{
  "scripts": {
    "gen:types": "npx supabase gen types typescript --project-id boymireuhuzaorgwqlvw > src/lib/supabase/database.ts"
  }
}
```

### 5.2 타입 사용 예시

```typescript
// src/lib/supabase/database.ts (자동 생성)
export type Database = {
  public: {
    Tables: {
      users: { ... }
      lectures: { ... }
      // ...
    }
  }
}

// 사용
import { Database } from '@/lib/supabase/database'

type Lecture = Database['public']['Tables']['lectures']['Row']
type LectureInsert = Database['public']['Tables']['lectures']['Insert']
type LectureUpdate = Database['public']['Tables']['lectures']['Update']
```

### 5.3 Supabase Client with Types

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 스키마 변경 체크리스트

기존 `supabase-schema.sql` 대비 변경 사항:

- [x] `users` 테이블에 `github_username`, `github_token` 추가
- [x] `lectures` 테이블 `source_type`, `source_url`, `file_path`, `platform` 제거
- [x] `lectures` 테이블에 `youtube_url`, `youtube_id`, `thumbnail_url` 추가
- [x] `lectures` 테이블 `status` enum 변경
- [x] `tasks` 테이블 `boilerplate_url` → `github_repo_url` 변경
- [x] `submissions` 테이블에 `submission_type`, `github_repo_url` 추가
