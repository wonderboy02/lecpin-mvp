# K-Audit MVP

GraphRAG 기반 학습 분석 시스템

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Graph DB**: Neo4j
- **Orchestrator**: LangGraph.js
- **LLM**: OpenAI GPT-4
- **Deploy**: Railway

## 프로젝트 구조

```
lecpin-mvp/
├── src/
│   ├── app/              # Next.js App Router
│   ├── lib/              # 핵심 로직
│   │   ├── neo4j.ts      # Neo4j 클라이언트
│   │   ├── graph-ingestion.ts  # 그래프 데이터 관리
│   │   └── langgraph-workflow.ts  # LangGraph 워크플로우
│   └── components/       # React 컴포넌트
├── .env.local            # 환경변수 (로컬)
├── .env.example          # 환경변수 예제
└── railway.json          # Railway 배포 설정
```

## 로컬 개발 환경 시작하기

### 방법 A: Docker Compose 사용 (권장)

모든 서비스(Next.js + Neo4j)를 Docker로 실행:

```bash
# 1. 환경변수 설정
cp .env.example .env.local
# .env.local에서 OPENAI_API_KEY만 설정

# 2. Docker Compose로 모든 서비스 실행
docker-compose up -d

# 3. 브라우저 접속
# Next.js: http://localhost:3000
# Neo4j Browser: http://localhost:7474
```

### 방법 B: Neo4j만 Docker, Next.js는 로컬 실행

```bash
# 1. Neo4j만 Docker로 실행
docker-compose up -d neo4j

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저 접속
# Next.js: http://localhost:3000
# Neo4j Browser: http://localhost:7474
```

### 환경변수 설정

`.env.local` 파일:

```bash
# Neo4j (로컬 Docker)
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=localpassword123

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

## Railway 배포

Railway에서 Next.js와 Neo4j를 모두 배포합니다.

**자세한 배포 가이드는 [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)를 참고하세요.**

### 간단 요약

1. **Next.js 앱 배포**
   ```bash
   railway login
   railway init
   railway up
   ```

2. **Neo4j 서비스 추가**
   - Railway 대시보드 → New → Template → Neo4j
   - 또는 New → Docker Image → `neo4j:5.15-community`

3. **환경변수 설정**
   ```bash
   NEO4J_URI=bolt://neo4j.railway.internal:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your-password
   OPENAI_API_KEY=sk-your-api-key
   ```

4. **Neo4j 스키마 초기화**
   - Neo4j Browser에서 `scripts/neo4j-init/01-schema.cypher` 실행

## 개발 로드맵

### Phase 1: Foundation ✅
- [x] Next.js + Neo4j 연동
- [x] Graph Ingestion 파이프라인
- [x] Vector Search RAG 구현 준비

### Phase 2: MVP Core (진행 중)
- [ ] Multi-Agent Workflow (LangGraph)
- [ ] 문제 생성 노드
- [ ] 전체 DB / 학습자 DB 솔버
- [ ] 결과 비교/채점 시스템
- [ ] UI 개발

### Phase 3: Optimization (선택)
- [ ] Auditor Agent 추가
- [ ] GraphRAG 검색 알고리즘 고도화
- [ ] 성능 튜닝

## 라이센스

MIT
