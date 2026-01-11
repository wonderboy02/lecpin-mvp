-- ================================================================
-- Supabase 마이그레이션 스키마
-- Neo4j → PostgreSQL + pgvector
-- ================================================================

-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================================
-- 2. Concept 테이블
-- ================================================================
CREATE TABLE concepts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-small (1536차원)
  is_learned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  learned_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_concepts_name ON concepts(name);
CREATE INDEX idx_concepts_is_learned ON concepts(is_learned);

-- pgvector IVFFlat 인덱스 (Cosine similarity)
-- lists 파라미터: sqrt(전체 행 수) 권장
-- - 1000개 미만: lists = 100
-- - 10000개: lists = 100
-- - 100000개: lists = 316
CREATE INDEX idx_concepts_embedding ON concepts
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_concepts_updated_at
BEFORE UPDATE ON concepts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 3. Relation 테이블
-- ================================================================
CREATE TABLE relations (
  id SERIAL PRIMARY KEY,
  from_concept_id INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  to_concept_id INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL,  -- prerequisite, component, related, uses, manages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 중복 관계 방지 (동일한 from, to, type 조합은 1개만)
  CONSTRAINT unique_relation UNIQUE(from_concept_id, to_concept_id, relation_type)
);

-- 인덱스
CREATE INDEX idx_relations_from ON relations(from_concept_id);
CREATE INDEX idx_relations_to ON relations(to_concept_id);
CREATE INDEX idx_relations_type ON relations(relation_type);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_relations_updated_at
BEFORE UPDATE ON relations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 4. 중심성 계산 뷰
-- ================================================================
-- Neo4j의 degree 계산을 PostgreSQL 뷰로 대체
-- 각 개념이 얼마나 많은 관계를 가지고 있는지 계산
CREATE VIEW concepts_with_centrality AS
SELECT
  c.id,
  c.name,
  c.description,
  c.is_learned,
  c.created_at,
  c.updated_at,
  c.learned_at,
  COUNT(r.id) as degree  -- 연결된 관계 수
FROM concepts c
LEFT JOIN relations r ON (c.id = r.from_concept_id OR c.id = r.to_concept_id)
GROUP BY c.id, c.name, c.description, c.is_learned, c.created_at, c.updated_at, c.learned_at;

-- ================================================================
-- 5. 벡터 검색 함수
-- ================================================================
-- Cosine similarity 기반 벡터 검색
-- 1 - cosine_distance = cosine_similarity
CREATE OR REPLACE FUNCTION search_concepts(
  query_embedding TEXT,        -- JSON 문자열로 전달된 벡터
  match_count INT,             -- 반환할 최대 개수
  learned_only BOOLEAN         -- true면 학습한 개념만 반환
)
RETURNS TABLE (
  name VARCHAR,
  description TEXT,
  is_learned BOOLEAN,
  similarity FLOAT             -- 유사도 점수 (0~1, 높을수록 유사)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.name,
    c.description,
    c.is_learned,
    1 - (c.embedding <=> query_embedding::vector) as similarity
  FROM concepts c
  WHERE (NOT learned_only OR c.is_learned = true)
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding::vector  -- Cosine distance (낮을수록 유사)
  LIMIT match_count;
END;
$$;

-- ================================================================
-- 6. 벡터 인덱스 존재 확인 함수
-- ================================================================
CREATE OR REPLACE FUNCTION check_vector_index_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  index_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'concepts'
      AND indexname = 'idx_concepts_embedding'
  ) INTO index_exists;

  RETURN index_exists;
END;
$$;

-- ================================================================
-- 7. 샘플 데이터 (선택사항)
-- ================================================================
-- 테스트용 샘플 데이터 (실제 배포 시에는 주석 처리 또는 제거)
/*
INSERT INTO concepts (name, description) VALUES
  ('리눅스', '오픈소스 운영체제'),
  ('커널', '운영체제의 핵심 부분'),
  ('프로세스', '실행 중인 프로그램'),
  ('스레드', '프로세스 내 실행 단위');

-- 관계 샘플 (ID는 실제 생성된 값으로 조정 필요)
INSERT INTO relations (from_concept_id, to_concept_id, relation_type)
SELECT
  (SELECT id FROM concepts WHERE name = '리눅스'),
  (SELECT id FROM concepts WHERE name = '커널'),
  'component';

INSERT INTO relations (from_concept_id, to_concept_id, relation_type)
SELECT
  (SELECT id FROM concepts WHERE name = '커널'),
  (SELECT id FROM concepts WHERE name = '프로세스'),
  'manages';

INSERT INTO relations (from_concept_id, to_concept_id, relation_type)
SELECT
  (SELECT id FROM concepts WHERE name = '프로세스'),
  (SELECT id FROM concepts WHERE name = '스레드'),
  'contains';
*/

-- ================================================================
-- 완료!
-- ================================================================
-- 임베딩 모델: OpenAI text-embedding-3-small (1536차원)
-- 비용 효율적이며 대부분의 사용 사례에 충분한 성능 제공
--
-- 다음 단계:
-- 1. Supabase Dashboard → SQL Editor에서 이 스크립트 실행
-- 2. .env.local에 SUPABASE_URL, SUPABASE_ANON_KEY 설정
-- 3. npm run dev로 로컬 테스트
-- 4. POST /api/ingestion으로 강의 텍스트 인제스션
-- 5. GET /api/concepts로 개념 목록 확인
-- ================================================================
