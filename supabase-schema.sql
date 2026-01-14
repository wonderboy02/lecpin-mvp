-- =============================================
-- Lecpin MVP - Supabase Schema
-- =============================================
-- 강의 분석 → 역량 추출 → 과제 생성 → 코드 제출 → AI 피드백
--
-- 실행 방법:
-- Supabase Dashboard → SQL Editor → New Query → 이 파일 내용 붙여넣기 → Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 기존 테이블 삭제 (개발 환경에서만 사용)
-- =============================================
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS competencies CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =============================================
-- Users Table (사용자)
-- =============================================
-- Supabase Auth와 연동, GitHub OAuth 정보 저장
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  github_username VARCHAR(255),
  github_token TEXT, -- GitHub API 호출용 OAuth token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Lectures Table (강의 정보)
-- =============================================
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id VARCHAR(20) NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  language VARCHAR(100), -- TypeScript, Python 등
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'extracting', 'analyzing', 'completed', 'failed')),
  error_message TEXT, -- 실패 시 에러 메시지
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Competencies Table (핵심 역량)
-- =============================================
CREATE TABLE competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Tasks Table (실습 과제)
-- =============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL, -- 왜 이 과제인가요?
  estimated_time VARCHAR(50) NOT NULL, -- 예: "2-3시간"
  difficulty VARCHAR(20) NOT NULL 
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tech_stack TEXT[] NOT NULL DEFAULT '{}', -- ["React", "TypeScript", "Vite"]
  steps JSONB NOT NULL DEFAULT '[]', -- [{order: 1, content: "..."}, ...]
  success_criteria TEXT[] NOT NULL DEFAULT '{}',
  github_repo_url TEXT, -- 생성된 GitHub Repo URL (템플릿에서 생성)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Submissions Table (코드 제출)
-- =============================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_type VARCHAR(20) NOT NULL 
    CHECK (submission_type IN ('github', 'upload')),
  github_repo_url TEXT, -- GitHub Repo URL (submission_type='github'일 때)
  file_path TEXT, -- 업로드된 ZIP 파일 경로 (submission_type='upload'일 때)
  description TEXT, -- 추가 설명
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'reviewing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Feedbacks Table (AI 피드백)
-- =============================================
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  grade VARCHAR(20) NOT NULL CHECK (grade IN ('Poor', 'Fair', 'Good', 'Excellent')),
  summary TEXT NOT NULL,
  code_quality JSONB NOT NULL DEFAULT '{}', -- {readability: 85, maintainability: 80, ...}
  strengths JSONB NOT NULL DEFAULT '[]', -- [{title, detail, file}, ...]
  improvements JSONB NOT NULL DEFAULT '[]', -- [{title, detail, file, severity, suggestion}, ...]
  next_steps TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_lectures_user_id ON lectures(user_id);
CREATE INDEX idx_lectures_status ON lectures(status);
CREATE INDEX idx_lectures_youtube_id ON lectures(youtube_id);
CREATE INDEX idx_competencies_lecture_id ON competencies(lecture_id);
CREATE INDEX idx_tasks_lecture_id ON tasks(lecture_id);
CREATE INDEX idx_submissions_task_id ON submissions(task_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_feedbacks_submission_id ON feedbacks(submission_id);

-- =============================================
-- Updated_at Trigger Function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lectures_updated_at
  BEFORE UPDATE ON lectures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: Users
-- =============================================
-- 자신의 데이터만 조회/수정 가능
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- RLS Policies: Lectures
-- =============================================
-- 자신의 강의만 CRUD 가능
CREATE POLICY "lectures_select_own" ON lectures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lectures_insert_own" ON lectures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lectures_update_own" ON lectures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "lectures_delete_own" ON lectures
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies: Competencies
-- =============================================
-- 자신의 강의에 연결된 역량만 조회 가능
CREATE POLICY "competencies_select_own" ON competencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE lectures.id = competencies.lecture_id 
      AND lectures.user_id = auth.uid()
    )
  );

-- INSERT는 lectures owner만 가능
CREATE POLICY "competencies_insert_own" ON competencies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE lectures.id = competencies.lecture_id 
      AND lectures.user_id = auth.uid()
    )
  );

-- =============================================
-- RLS Policies: Tasks
-- =============================================
-- 자신의 강의에 연결된 과제만 CRUD 가능
CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE lectures.id = tasks.lecture_id 
      AND lectures.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE lectures.id = tasks.lecture_id 
      AND lectures.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE lectures.id = tasks.lecture_id 
      AND lectures.user_id = auth.uid()
    )
  );

-- =============================================
-- RLS Policies: Submissions
-- =============================================
-- 자신의 제출만 CRUD 가능
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "submissions_update_own" ON submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies: Feedbacks
-- =============================================
-- 자신의 제출에 연결된 피드백만 조회 가능
CREATE POLICY "feedbacks_select_own" ON feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = feedbacks.submission_id 
      AND submissions.user_id = auth.uid()
    )
  );

-- INSERT는 자신의 submission에만 가능
CREATE POLICY "feedbacks_insert_own" ON feedbacks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = feedbacks.submission_id 
      AND submissions.user_id = auth.uid()
    )
  );

-- =============================================
-- Storage Bucket RLS Policies
-- =============================================
-- 아래 정책들은 Supabase Dashboard → Storage → Policies에서 실행하세요

/*
-- submissions 버킷 생성 후 적용할 정책들:

-- 1. 업로드 정책: 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 읽기 정책: 자신이 업로드한 파일만 읽기 가능
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 삭제 정책: 자신이 업로드한 파일만 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- =============================================
-- Helper Functions
-- =============================================

-- 사용자 생성/업데이트 함수 (Auth trigger용)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth user 생성 시 자동으로 public.users에도 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 완료!
-- =============================================
-- 다음 단계:
-- 1. Supabase Dashboard → Storage → New Bucket → "submissions" 생성
-- 2. Storage Policies 적용 (위 주석 참고)
-- 3. Authentication → Providers → GitHub 설정
