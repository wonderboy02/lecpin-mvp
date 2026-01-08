// K-Audit GraphRAG 스키마 초기화

// 1. Concept 노드 제약조건 및 인덱스 생성
CREATE CONSTRAINT concept_name_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.name IS UNIQUE;

CREATE INDEX concept_name_index IF NOT EXISTS
FOR (c:Concept) ON (c.name);

CREATE INDEX concept_learned_index IF NOT EXISTS
FOR (c:Concept) ON (c.is_learned);

// 2. 벡터 인덱스 생성 (임베딩 검색용)
// 1536 차원은 OpenAI text-embedding-3-small 기준
CREATE VECTOR INDEX concept_embedding_index IF NOT EXISTS
FOR (c:Concept) ON (c.embedding)
OPTIONS {indexConfig: {
  `vector.dimensions`: 1536,
  `vector.similarity_function`: 'cosine'
}};

// 3. 샘플 데이터 생성 (테스트용)
MERGE (linux:Concept {name: "Linux"})
SET linux.description = "오픈소스 운영체제",
    linux.is_learned = false,
    linux.created_at = datetime();

MERGE (kernel:Concept {name: "Kernel"})
SET kernel.description = "운영체제의 핵심 구성요소",
    kernel.is_learned = false,
    kernel.created_at = datetime();

MERGE (process:Concept {name: "Process"})
SET process.description = "실행 중인 프로그램의 인스턴스",
    process.is_learned = false,
    process.created_at = datetime();

MERGE (thread:Concept {name: "Thread"})
SET thread.description = "프로세스 내의 실행 단위",
    thread.is_learned = false,
    thread.created_at = datetime();

MERGE (shell:Concept {name: "Shell"})
SET shell.description = "사용자와 커널 사이의 인터페이스",
    shell.is_learned = false,
    shell.created_at = datetime();

// 4. 관계 생성
MERGE (linux)-[:RELATED_TO {type: "contains"}]->(kernel);
MERGE (kernel)-[:RELATED_TO {type: "manages"}]->(process);
MERGE (process)-[:RELATED_TO {type: "contains"}]->(thread);
MERGE (linux)-[:RELATED_TO {type: "provides"}]->(shell);
MERGE (shell)-[:RELATED_TO {type: "interacts_with"}]->(kernel);

// 5. 통계 확인
MATCH (c:Concept)
RETURN count(c) as total_concepts;

MATCH ()-[r:RELATED_TO]->()
RETURN count(r) as total_relations;
