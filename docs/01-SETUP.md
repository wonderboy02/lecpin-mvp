# 01. 환경 설정 가이드

## 목차
1. [필수 계정 및 서비스](#1-필수-계정-및-서비스)
2. [GitHub OAuth App 설정](#2-github-oauth-app-설정)
3. [Supabase 프로젝트 설정](#3-supabase-프로젝트-설정)
4. [OpenAI API 설정](#4-openai-api-설정)
5. [로컬 개발 환경](#5-로컬-개발-환경)
6. [Railway 배포 설정](#6-railway-배포-설정)

---

## 1. 필수 계정 및 서비스

| 서비스 | 용도 | 가입 URL |
|--------|------|----------|
| Supabase | DB, Auth, Storage | https://supabase.com |
| GitHub | OAuth, Repo API | https://github.com |
| OpenAI | AI API | https://platform.openai.com |
| Railway | 배포 | https://railway.app |

---

## 2. GitHub OAuth App 설정

### 2.1 OAuth App 생성

1. GitHub → Settings → Developer settings → OAuth Apps
2. "New OAuth App" 클릭
3. 다음 정보 입력:

```
Application name: Lecpin MVP
Homepage URL: http://localhost:3000 (개발) 또는 프로덕션 URL
Authorization callback URL: https://boymireuhuzaorgwqlvw.supabase.co/auth/v1/callback
```

4. "Register application" 클릭
5. **Client ID** 복사
6. "Generate a new client secret" → **Client Secret** 복사

### 2.2 필요한 Scopes

GitHub OAuth 로그인 시 요청할 scopes:

```
repo        # Repository 생성/수정 권한
read:user   # 사용자 정보 읽기 (기본)
user:email  # 이메일 정보 읽기
```

---

## 3. Supabase 프로젝트 설정

### 3.1 프로젝트 정보

```
Project URL: https://boymireuhuzaorgwqlvw.supabase.co
Project ID: boymireuhuzaorgwqlvw
```

### 3.2 GitHub OAuth Provider 설정

Supabase Dashboard → Authentication → Providers → GitHub

1. Enable GitHub provider: **ON**
2. Client ID: (GitHub OAuth App에서 복사)
3. Client Secret: (GitHub OAuth App에서 복사)
4. Save

### 3.3 Redirect URLs 설정

Supabase Dashboard → Authentication → URL Configuration

```
Site URL: http://localhost:3000 (개발시)
Redirect URLs:
  - http://localhost:3000/auth/callback
  - https://your-production-url.com/auth/callback
```

### 3.4 Storage Buckets 생성

Supabase Dashboard → Storage → New Bucket

**Bucket 1: submissions**
```
Name: submissions
Public: false (private)
File size limit: 50MB
Allowed MIME types: application/zip, application/x-zip-compressed
```

### 3.5 Storage RLS 정책

```sql
-- submissions 버킷 정책

-- 업로드 정책: 인증된 사용자만 자신의 폴더에 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 읽기 정책: 자신이 업로드한 파일만 읽기 가능
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 삭제 정책: 자신이 업로드한 파일만 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3.6 Database Schema 실행

Supabase Dashboard → SQL Editor → New Query

`supabase-schema.sql` 파일 내용 실행

---

## 4. OpenAI API 설정

### 4.1 API Key 생성

1. https://platform.openai.com/api-keys
2. "Create new secret key" 클릭
3. 이름 입력 (예: "lecpin-mvp")
4. API Key 복사 및 안전하게 저장

### 4.2 사용 모델

| 용도 | 모델 | 예상 비용 |
|------|------|----------|
| 강의 분석 | gpt-4o | ~$0.01/분석 |
| 과제 생성 | gpt-4o | ~$0.02/생성 |
| 코드 리뷰 | gpt-4o | ~$0.05/리뷰 |

---

## 5. 로컬 개발 환경

### 5.1 필수 도구

```bash
# Node.js 20+ 확인
node --version

# npm 확인
npm --version

# yt-dlp 설치 (자막 추출용)
# Windows (winget)
winget install yt-dlp

# macOS (homebrew)
brew install yt-dlp

# 설치 확인
yt-dlp --version
```

### 5.2 환경 변수 파일

`.env.local` 파일 생성:

```env
# ===========================================
# Supabase
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://boymireuhuzaorgwqlvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ===========================================
# OpenAI
# ===========================================
OPENAI_API_KEY=sk-your-openai-api-key-here

# ===========================================
# App Configuration
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# GitHub Template Repository
# ===========================================
# 과제용 템플릿 레포지토리 (본인 계정에 생성)
GITHUB_TEMPLATE_OWNER=your-github-username
GITHUB_TEMPLATE_REPO=lecpin-practice-template
```

### 5.3 Supabase CLI 설치 (타입 생성용)

```bash
# npm으로 설치
npm install -g supabase

# 로그인
npx supabase login

# 타입 생성 테스트
npm run gen:types
```

### 5.4 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 열기
open http://localhost:3000
```

---

## 6. Railway 배포 설정

### 6.1 Railway 프로젝트 설정

1. Railway Dashboard → New Project → Deploy from GitHub
2. 레포지토리 선택
3. 환경 변수 설정 (Settings → Variables)

### 6.2 Railway 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://boymireuhuzaorgwqlvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://your-railway-url.railway.app

# GitHub Template
GITHUB_TEMPLATE_OWNER=
GITHUB_TEMPLATE_REPO=
```

### 6.3 Dockerfile 설정 (yt-dlp 포함)

Railway는 Nixpacks를 사용하므로 yt-dlp 설치를 위해 `nixpacks.toml` 수정:

```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["nodejs_20", "yt-dlp", "ffmpeg"]

[phases.build]
cmds = ["npm ci", "npm run build"]

[start]
cmd = "npm run start"
```

### 6.4 Production Redirect URL 설정

Railway 배포 후:

1. Railway → Settings → Domains에서 도메인 확인
2. GitHub OAuth App의 callback URL 업데이트
3. Supabase의 Redirect URLs에 추가

---

## 체크리스트

### 설정 완료 확인

- [ ] GitHub OAuth App 생성 완료
- [ ] Supabase GitHub Provider 설정 완료
- [ ] Supabase Storage Bucket 생성 완료
- [ ] OpenAI API Key 생성 완료
- [ ] `.env.local` 파일 설정 완료
- [ ] yt-dlp 설치 완료
- [ ] `npm run dev` 정상 실행

### 테스트 체크리스트

- [ ] GitHub 로그인 테스트
- [ ] Supabase 연결 테스트
- [ ] OpenAI API 호출 테스트
- [ ] yt-dlp 자막 추출 테스트
