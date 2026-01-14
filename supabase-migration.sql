-- =============================================
-- Lecpin MVP - Schema Migration
-- =============================================
-- 기존 스키마에 누락된 필드 추가
-- Supabase Dashboard → SQL Editor → New Query → 실행

-- =============================================
-- 1. Users 테이블: GitHub 정보 추가
-- =============================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS github_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS github_token TEXT;

-- =============================================
-- 2. Lectures 테이블: YouTube 관련 필드 추가
-- =============================================
ALTER TABLE lectures
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- status 컬럼 CHECK 제약조건 업데이트 (기존 제약조건 제거 후 추가)
ALTER TABLE lectures DROP CONSTRAINT IF EXISTS lectures_status_check;
ALTER TABLE lectures ADD CONSTRAINT lectures_status_check
  CHECK (status IN ('pending', 'extracting', 'analyzing', 'completed', 'failed'));

-- =============================================
-- 3. Tasks 테이블: GitHub Repo URL 추가
-- =============================================
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS github_repo_url TEXT;

-- =============================================
-- 4. Submissions 테이블: 제출 타입 추가
-- =============================================
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submission_type VARCHAR(20) DEFAULT 'upload',
ADD COLUMN IF NOT EXISTS github_repo_url TEXT;

-- submission_type CHECK 제약조건 추가
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_submission_type_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_submission_type_check
  CHECK (submission_type IN ('github', 'upload'));

-- =============================================
-- 5. Indexes 추가
-- =============================================
CREATE INDEX IF NOT EXISTS idx_lectures_youtube_id ON lectures(youtube_id);
CREATE INDEX IF NOT EXISTS idx_lectures_status ON lectures(status);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- =============================================
-- 6. Auth Trigger 함수 업데이트 (GitHub 정보 저장)
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, github_username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    github_username = COALESCE(EXCLUDED.github_username, users.github_username),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger가 없으면 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 7. Storage Bucket 생성 (수동으로 해야 함)
-- =============================================
-- Supabase Dashboard → Storage → New Bucket
-- Bucket name: submissions
-- Public: OFF
-- File size limit: 50MB
-- Allowed MIME types: application/zip, application/x-zip-compressed

-- =============================================
-- 완료!
-- =============================================
-- 실행 후 타입 재생성: npm run gen:types
