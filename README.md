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

## 로컬 개발 환경 시작하기 (권장 ⭐)

### 1. 환경변수 설정

```bash
# .env.example을 복사해서 .env 생성
cp .env.example .env

# .env 파일을 열어서 OPENAI_API_KEY만 수정
# NEO4J_* 설정은 docker-compose.dev.yml과 일치하도록 이미 설정되어 있음
```

`.env` 파일 내용 확인:
```bash
# Neo4j (Docker Compose 개발 환경)
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=localpassword123

# OpenAI API - 여기만 수정하세요
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Neo4j 실행 (Docker)

```bash
# Neo4j만 Docker로 실행
docker-compose -f docker-compose.dev.yml up -d

# 상태 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인 (문제 발생 시)
docker-compose -f docker-compose.dev.yml logs -f neo4j
```

### 3. Next.js 개발 서버 실행 (로컬)

```bash
# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```

### 4. 브라우저 접속

- **Next.js**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474
  - Username: `neo4j`
  - Password: `localpassword123`

### 5. 개발 완료 후 종료

```bash
# Neo4j 중지
docker-compose -f docker-compose.dev.yml down

# Next.js는 Ctrl+C로 종료
```

---

## 프로덕션 환경 (Docker Compose)

전체 스택을 Docker로 빌드하고 실행:

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정

# 2. 전체 스택 빌드 및 실행
docker-compose up -d --build

# 3. 로그 확인
docker-compose logs -f

# 4. 종료
docker-compose down
```

**참고**: 프로덕션 배포는 Railway를 사용합니다. Docker Compose는 로컬 프로덕션 테스트용입니다.

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
