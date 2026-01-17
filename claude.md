# Lecpin MVP - 프로젝트 가이드

## 프로젝트 개요

Lecpin은 강의 영상/자료를 분석하여 자동으로 실습 문제를 생성하고, 학생들의 제출물에 대한 피드백을 제공하는 AI 기반 교육 플랫폼입니다.

## 기술 스택

### Frontend & Framework
- **Next.js**: 15.5.9 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.1.9

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Shadcn/ui**: UI component system

### Backend & Database
- **Supabase**: PostgreSQL database + Authentication
- **OpenAI API**: GPT-4 기반 강의 분석 및 과제 생성

### Additional Libraries
- `youtube-transcript`: 유튜브 자막 추출
- `jszip`: ZIP 파일 처리
- `react-hook-form` + `zod`: 폼 검증
- `date-fns`: 날짜 처리
- `recharts`: 데이터 시각화

## 배포 환경

### Railway
- **플랫폼**: Railway (https://railway.app)
- **빌드 방식**: Dockerfile
- **설정 파일**: `railway.json`
- **재시작 정책**: ON_FAILURE (최대 10회 재시도)
- **Dockerfile**: 프로덕션 빌드 및 standalone 모드

### 배포 명령어
```bash
# Railway CLI로 배포
railway up

# 또는 Git push로 자동 배포
git push origin main
```

## 데이터베이스

### Supabase
- **프로젝트 ID**: `boymireuhuzaorgwqlvw`
- **URL**: https://boymireuhuzaorgwqlvw.supabase.co
- **스키마 파일**: `supabase-schema.sql`
- **마이그레이션**: `supabase-migration.sql`

### Type Generation
```bash
# Supabase 타입 자동 생성
npm run gen:types
```

### 주요 테이블
- `users`: 사용자 정보
- `lectures`: 강의 정보
- `tasks`: 생성된 과제
- `user_tasks`: 사용자별 과제 할당
- `submissions`: 과제 제출물
- `feedback`: AI 피드백

## 환경 변수

### 필수 환경 변수 (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://boymireuhuzaorgwqlvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# GitHub Template Repository
GITHUB_TEMPLATE_OWNER=your-github-username
GITHUB_TEMPLATE_REPO=lecpin-practice-template

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Railway 배포 시
Railway 대시보드에서 동일한 환경 변수를 설정해야 합니다.

## 프로젝트 구조

```
lecpin-mvp/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # 인증 관련
│   │   │   ├── lectures/             # 강의 분석
│   │   │   ├── tasks/                # 과제 생성/관리
│   │   │   ├── submissions/          # 제출물 처리
│   │   │   ├── feedback/             # AI 피드백
│   │   │   └── users/                # 사용자 관리
│   │   ├── dashboard/                # 대시보드 페이지
│   │   ├── guide/                    # 가이드 페이지
│   │   └── design-system/            # 디자인 시스템 (개발용)
│   ├── components/                   # React 컴포넌트
│   ├── lib/                          # 유틸리티 & 설정
│   │   ├── supabase/                 # Supabase 클라이언트
│   │   └── openai/                   # OpenAI 설정
│   └── hooks/                        # Custom React Hooks
├── public/                           # 정적 파일
├── supabase/                         # Supabase 로컬 개발
├── railway.json                      # Railway 설정
├── Dockerfile                        # 프로덕션 빌드
└── package.json
```

## 주요 기능

### 1. 강의 분석 (`/api/lectures/analyze`)
- YouTube URL 또는 강의 자료 업로드
- AI 기반 콘텐츠 분석
- 핵심 개념 추출

### 2. 과제 생성 (`/api/tasks/generate`)
- 강의 내용 기반 자동 과제 생성
- GitHub 템플릿 레포지토리 생성
- README.md 자동 생성

### 3. 과제 제출 (`/api/submissions`)
- GitHub 레포지토리 URL 제출
- ZIP 파일 업로드
- 제출 이력 관리

### 4. AI 피드백 (`/api/feedback/generate`)
- 코드 분석
- 개선 제안
- 학습 가이드

### 5. 사용자 관리
- Supabase Auth 기반 인증
- 온보딩 플로우
- 언어 설정 (한국어/영어)

## 개발 가이드

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 린트
npm run lint

# Supabase 타입 생성
npm run gen:types
```

### 코딩 컨벤션
- TypeScript strict mode 사용
- ESLint + Prettier 설정 준수
- 컴포넌트는 `src/components` 에 위치
- API 라우트는 `src/app/api` 에 위치
- Server Components 우선 사용 (필요시에만 'use client')

### 데이터베이스 작업
```bash
# Supabase 로컬 시작
npx supabase start

# 마이그레이션 생성
npx supabase migration new migration_name

# 타입 재생성
npm run gen:types
```

## 주요 API 엔드포인트

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lectures/analyze` | POST | 강의 분석 |
| `/api/tasks/generate` | POST | 과제 생성 |
| `/api/tasks/create-repo` | POST | GitHub 레포 생성 |
| `/api/submissions` | POST | 과제 제출 |
| `/api/submissions/upload` | POST | ZIP 업로드 |
| `/api/feedback/generate` | POST | AI 피드백 생성 |
| `/api/users/onboarding` | POST | 온보딩 완료 |
| `/api/users/language` | PATCH | 언어 설정 변경 |

## 트러블슈팅

### Railway 배포 이슈
- 환경 변수가 모두 설정되었는지 확인
- Dockerfile 빌드 로그 확인
- `railway logs` 명령어로 런타임 로그 확인

### Supabase 연결 이슈
- NEXT_PUBLIC_SUPABASE_URL과 ANON_KEY 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### OpenAI API 이슈
- API 키 유효성 확인
- Rate limit 확인
- 충분한 크레딧이 있는지 확인

## 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
