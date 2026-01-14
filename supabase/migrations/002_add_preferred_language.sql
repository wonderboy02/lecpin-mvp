-- 사용자 언어 설정 필드 추가
ALTER TABLE users
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'ko'
CHECK (preferred_language IN ('ko', 'en'));

-- 기존 사용자 기본값 설정
UPDATE users SET preferred_language = 'ko' WHERE preferred_language IS NULL;
