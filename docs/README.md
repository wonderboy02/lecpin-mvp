# Lecpin MVP - 구현 문서

> 강의 영상을 실습 과제로 변환하는 AI 코칭 플랫폼

## 프로젝트 개요

```
사용자 플로우:

[GitHub 로그인] → [YouTube URL 입력] → [AI 강의 분석] → [역량 추출]
                                                              ↓
[AI 피드백] ← [코드 제출] ← [실습 과제 진행] ← [과제 생성 + GitHub Repo]
```

## 기술 스택

| 구분 | 기술 | 용도 |
|------|-----|------|
| **Frontend** | Next.js 15 (App Router) | React 19, Server Components |
| **Backend** | Next.js API Routes | Server Actions |
| **Database** | Supabase PostgreSQL | 데이터 저장 |
| **Auth** | Supabase Auth + GitHub OAuth | 로그인 + GitHub API 연동 |
| **Storage** | Supabase Storage | 파일 업로드 |
| **AI** | OpenAI GPT-4o | 분석, 과제 생성, 코드 리뷰 |
| **Transcript** | yt-dlp | YouTube 자막 추출 |
| **Deploy** | Railway | Docker 기반 배포 |

## 문서 구조

```
docs/
├── README.md          # 이 파일 (전체 개요)
├── 01-SETUP.md        # 환경 설정 가이드
├── 02-DATABASE.md     # DB 스키마 및 타입
├── 03-API.md          # API 엔드포인트 스펙
├── 04-PROMPTS.md      # AI 프롬프트 설계
└── 05-COMPONENTS.md   # 컴포넌트 수정 목록
```

## 핵심 기능 구현 순서

### Phase 1: 인프라 설정
1. [ ] Supabase 프로젝트 설정 (Storage Bucket, RLS)
2. [ ] GitHub OAuth App 생성 및 연동
3. [ ] 환경 변수 설정
4. [ ] Supabase 타입 생성 설정

### Phase 2: 인증 시스템
5. [ ] GitHub OAuth 로그인 구현
6. [ ] Auth Callback 핸들러
7. [ ] Provider Token 저장 로직
8. [ ] 로그인/로그아웃 UI

### Phase 3: 강의 분석
9. [ ] YouTube URL 입력 API
10. [ ] yt-dlp 자막 추출 (Railway Docker)
11. [ ] OpenAI 역량 분석 API
12. [ ] 분석 결과 저장

### Phase 4: 과제 생성
13. [ ] OpenAI 과제 생성 API
14. [ ] GitHub Template Repo 생성 API
15. [ ] 과제 화면 연동

### Phase 5: 코드 제출 & 피드백
16. [ ] ZIP 파일 업로드 (또는 GitHub Repo URL)
17. [ ] OpenAI 코드 리뷰 API
18. [ ] 피드백 화면 연동

## 주요 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/callback` | GitHub OAuth 콜백 |
| POST | `/api/lectures/analyze` | YouTube 강의 분석 |
| POST | `/api/tasks/generate` | 실습 과제 생성 |
| POST | `/api/tasks/create-repo` | GitHub Repo 생성 |
| POST | `/api/submissions/upload` | 코드 제출 |
| POST | `/api/feedback/generate` | AI 피드백 생성 |

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://boymireuhuzaorgwqlvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# GitHub OAuth (Supabase Dashboard에서 설정)
# - Client ID
# - Client Secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 3. Supabase 타입 생성
npm run gen:types

# 4. 개발 서버 실행
npm run dev
```

## 참고 문서

- [Supabase Auth - GitHub OAuth](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [GitHub REST API - Create Repo from Template](https://docs.github.com/en/rest/repos/repos#create-a-repository-using-a-template)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
