-- =============================================
-- Migration: Add attempt_number to submissions
-- =============================================
-- 같은 과제에 여러 번 제출할 수 있도록 attempt_number 추가

-- submissions 테이블에 attempt_number 컬럼 추가
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

-- 이력 조회 최적화를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_submissions_task_user_attempt
ON submissions(task_id, user_id, attempt_number DESC);
