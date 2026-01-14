# Lecpin MVP 개선 프로젝트 - 공통 문서

## 1. 프로젝트 개요

### 1.1 목표
현재 단일 페이지 기반의 Lecpin MVP를 **다중 페이지 구조**로 개선하여:
- 사용자 경험(UX) 향상
- 진행 상태 영속성 확보
- 다국어 지원 기반 마련

### 1.2 작업 분담

| 담당 | 작업 영역 | 주요 파일 |
|------|----------|----------|
| **A** | 대시보드 + DB 상태 저장 | `/dashboard`, API routes, DB schema |
| **B** | 네비게이션 + 언어 설정 | `Header`, `StepNavigation`, i18n |
| **C** | README + Guide + 온보딩 | GitHub API, `/guide`, `/onboarding` |

---

## 2. 현재 프로젝트 구조

### 2.1 디렉토리 구조
```
src/
├── app/
│   ├── page.tsx              # 메인 페이지 (5단계 통합)
│   ├── login/page.tsx        # 로그인
│   ├── layout.tsx
│   └── api/
│       ├── auth/callback/    # OAuth 콜백
│       ├── lectures/analyze/ # 강의 분석
│       ├── tasks/
│       │   ├── generate/     # 과제 생성
│       │   └── create-repo/  # GitHub 레포 생성
│       ├── submissions/      # 제출
│       │   └── upload/       # ZIP 업로드
│       └── feedback/generate/ # AI 피드백
├── components/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── lecture-input.tsx
│   ├── competency-summary.tsx
│   ├── practical-task.tsx
│   ├── submission-upload.tsx
│   ├── ai-feedback.tsx
│   └── ui/                   # shadcn/ui 컴포넌트
├── hooks/
│   └── use-user.ts
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── database.ts       # DB 타입 정의
└── types/
    └── index.ts              # 공통 타입
```

### 2.2 현재 사용자 플로우
```
[로그인] → [강의 URL 입력] → [역량 분석] → [과제 생성] → [레포 생성] → [코드 작성] → [제출] → [AI 피드백]
```

**문제점:**
- 모든 상태가 React state에만 저장 (새로고침 시 유실)
- 이전 단계로 돌아갈 수 없음
- 진행 중인 과제 목록 없음

---

## 3. 개선 후 페이지 구조

```
/ (랜딩 페이지)
├── /login
├── /onboarding              # [C] 신규 사용자 가이드
├── /guide                   # [C] 사용 가이드
├── /dashboard               # [A] 진행중인 과제 목록
│   └── /dashboard/[id]      # [A] 개별 과제 진행 (5단계)
└── /api/...
```

---

## 4. DB 스키마 변경사항

### 4.1 기존 테이블
- `users` - 사용자
- `lectures` - 강의
- `competencies` - 역량
- `tasks` - 과제
- `submissions` - 제출
- `feedbacks` - 피드백

### 4.2 변경/추가 필요

#### `users` 테이블 수정 [B 담당]
```sql
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'ko';
-- 'ko' | 'en'
```

#### `user_tasks` 테이블 신규 [A 담당]
```sql
CREATE TABLE user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  feedback_id UUID REFERENCES feedbacks(id) ON DELETE SET NULL,

  current_step VARCHAR(20) NOT NULL DEFAULT 'input',
  -- 'input' | 'summary' | 'task' | 'submit' | 'feedback' | 'completed'

  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  -- 'in_progress' | 'completed' | 'abandoned'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_status ON user_tasks(status);
```

---

## 5. 공통 타입 정의

### 5.1 `src/types/index.ts` 추가 타입

```typescript
// 기존 Step 타입 확장
export type Step = 'input' | 'summary' | 'task' | 'submit' | 'feedback' | 'completed'

// 사용자 언어 설정
export type Language = 'ko' | 'en'

// 사용자 과제 진행 상태
export interface UserTask {
  id: string
  user_id: string
  lecture_id: string
  task_id: string | null
  submission_id: string | null
  feedback_id: string | null
  current_step: Step
  status: 'in_progress' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
  // Relations (optional)
  lecture?: Lecture
  task?: Task
  submission?: Submission
  feedback?: Feedback
}

// User 타입 확장
export interface User {
  // ... 기존 필드
  preferred_language: Language
}
```

---

## 6. 공통 컴포넌트

### 6.1 StepNavigation [B 담당, A/C 사용]

```typescript
// src/components/step-navigation.tsx
interface StepNavigationProps {
  currentStep: Step
  completedSteps: Step[]
  onStepClick: (step: Step) => void
  onPrevious?: () => void
  onNext?: () => void
  disableFutureSteps?: boolean
}
```

### 6.2 LanguageContext [B 담당, 전체 사용]

```typescript
// src/contexts/language-context.tsx
interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string  // 번역 함수 (간단 버전)
}
```

---

## 7. API 엔드포인트 정리

### 7.1 기존 API
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/callback` | OAuth 콜백 |
| POST | `/api/lectures/analyze` | 강의 분석 |
| POST | `/api/tasks/generate` | 과제 생성 |
| POST | `/api/tasks/create-repo` | GitHub 레포 생성 |
| POST | `/api/submissions` | GitHub URL 제출 |
| POST | `/api/submissions/upload` | ZIP 파일 제출 |
| POST | `/api/feedback/generate` | AI 피드백 생성 |

### 7.2 신규 API
| Method | Path | 담당 | 설명 |
|--------|------|------|------|
| GET | `/api/user-tasks` | A | 사용자의 과제 목록 |
| POST | `/api/user-tasks` | A | 새 과제 세션 시작 |
| PATCH | `/api/user-tasks/[id]` | A | 진행 상태 업데이트 |
| DELETE | `/api/user-tasks/[id]` | A | 과제 세션 삭제/포기 |
| PATCH | `/api/users/language` | B | 언어 설정 변경 |
| PUT | `/api/tasks/[id]/readme` | C | README 업데이트 |

---

## 8. 환경 변수

### 8.1 기존
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_TEMPLATE_OWNER=
GITHUB_TEMPLATE_REPO=
OPENAI_API_KEY=
```

### 8.2 추가 필요 없음
- GitHub Contents API는 기존 사용자 토큰 사용
- i18n은 클라이언트 사이드 처리

---

## 9. 작업 순서 및 의존성

```
Week 1:
  [A] DB 마이그레이션 (user_tasks)  ←── 선행 필수
  [B] users.preferred_language 추가
  [C] README 업데이트 API

Week 2:
  [A] user-tasks API 구현  ←── [B], [C] 대기
  [B] LanguageContext 구현
  [C] Guide 페이지

Week 3:
  [A] Dashboard UI
  [B] StepNavigation 컴포넌트  ←── [A] Dashboard 필요
  [C] Onboarding 플로우

Week 4:
  [A] Dashboard/[id] 통합
  [B] Header 언어 드롭다운 + 네비게이션 연결
  [C] 전체 플로우 테스트
```

---

## 10. 브랜치 전략

```
main
├── feature/dashboard (A)
├── feature/navigation-language (B)
└── feature/readme-guide-onboarding (C)
```

**Merge 순서:**
1. A의 DB 마이그레이션 먼저 main에 머지
2. 이후 각자 작업 진행
3. 최종 통합 전 리베이스 후 순차 머지

---

## 11. 테스트 체크리스트

### 공통
- [ ] 로그인/로그아웃 정상 동작
- [ ] 새로고침 후 상태 유지
- [ ] 모바일 반응형

### A (대시보드)
- [ ] 과제 목록 조회
- [ ] 과제 상세 진입
- [ ] 단계별 상태 저장

### B (네비게이션/언어)
- [ ] 이전/다음 버튼 동작
- [ ] 완료된 단계 클릭 이동
- [ ] 언어 변경 시 즉시 반영

### C (README/Guide)
- [ ] 레포 생성 시 README 포함
- [ ] Guide 페이지 표시
- [ ] 온보딩 완료 후 대시보드 이동

---

## 12. 문의 및 협업

- 공통 타입 변경 시 → 모든 담당자에게 공유
- API 스펙 변경 시 → 해당 API 사용하는 담당자와 협의
- DB 스키마 변경 시 → A에게 먼저 확인

**Slack 채널:** #lecpin-dev
