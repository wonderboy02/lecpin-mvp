# Railway 배포 가이드

## 1. Railway 프로젝트 생성

### 1.1. Next.js 앱 배포

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 첫 배포
railway up
```

## 2. Neo4j 서비스 추가

Railway에서 Neo4j를 띄우는 방법은 두 가지입니다:

### 방법 A: Railway Template 사용 (권장)

1. Railway 대시보드 접속
2. 프로젝트 선택
3. **New** → **Template** → **Neo4j** 검색
4. Neo4j 템플릿 추가
5. 환경변수 설정:
   - `NEO4J_AUTH`: `neo4j/your-strong-password`

### 방법 B: Docker Image 직접 배포

1. Railway 대시보드에서 **New** → **Empty Service**
2. 서비스 이름: `neo4j`
3. **Settings** → **Deploy**
   - Source: Docker Image
   - Image: `neo4j:5.15-community`
4. **Volume 설정 (필수!)**:
   - Command Palette (`⌘K`) 또는 우클릭 → **Create Volume**
   - Neo4j 서비스에 연결
   - Mount Path: `/data`
   - 설명: 이 설정이 없으면 컨테이너 재시작 시 모든 데이터가 삭제됩니다
5. **Variables** 탭에서 환경변수 추가:
   ```
   NEO4J_AUTH=neo4j/your-strong-password
   NEO4J_PLUGINS=["apoc","graph-data-science"]
   NEO4J_dbms_memory_heap_max__size=2G
   NEO4J_dbms_memory_heap_initial__size=512m
   NEO4J_dbms_memory_pagecache_size=512m
   NEO4J_dbms_security_procedures_unrestricted=apoc.*,gds.*
   RAILWAY_RUN_UID=0
   ```
   - `RAILWAY_RUN_UID=0`: Volume 권한 문제 방지
6. **Networking** 탭에서:
   - Private Networking 활성화
   - 포트 7687 (Bolt) 노출

## 3. Next.js 앱 환경변수 설정

Neo4j 서비스가 띄워진 후, Next.js 앱의 환경변수를 설정합니다:

Railway 대시보드 → Next.js 서비스 → **Variables** 탭:

```bash
# Neo4j 연결 (Private Network 사용)
NEO4J_URI=bolt://neo4j.railway.internal:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-strong-password

# 또는 Public URL 사용 (권장하지 않음)
# NEO4J_URI=neo4j+s://your-neo4j-url.railway.app:7687

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# LangSmith (선택)
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=k-audit-mvp

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

## 4. Neo4j 초기 설정

Neo4j가 배포된 후, 스키마를 초기화합니다:

### 4.1. Neo4j Browser 접속

Railway 대시보드 → Neo4j 서비스 → **Connect** → Public URL 복사

브라우저에서 Neo4j Browser 접속 후 로그인

### 4.2. 스키마 실행

`scripts/neo4j-init/01-schema.cypher` 파일의 내용을 Neo4j Browser에서 실행:

```cypher
// 제약조건 및 인덱스 생성
CREATE CONSTRAINT concept_name_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.name IS UNIQUE;

CREATE INDEX concept_name_index IF NOT EXISTS
FOR (c:Concept) ON (c.name);

// ... 나머지 스키마
```

또는 API Route로 초기화:

```bash
# Next.js 앱이 배포된 후
curl -X POST https://your-app.railway.app/api/neo4j/init
```

## 5. 배포 확인

```bash
# Next.js 앱 접속
https://your-app.railway.app

# Neo4j Browser 접속
https://neo4j-production.up.railway.app
```

## 로컬 개발 환경

로컬에서는 Docker Compose를 사용합니다:

```bash
# Neo4j + Next.js 모두 실행
docker-compose up -d

# Next.js만 로컬에서 실행 (Neo4j는 Docker)
docker-compose up -d neo4j
npm run dev
```

로컬 환경변수 (`.env.local`):
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=localpassword123
OPENAI_API_KEY=sk-your-api-key
```

## 트러블슈팅

### 데이터가 사라지는 문제

**증상**: 컨테이너 재시작 후 Neo4j 데이터가 초기화됨

**원인**: Volume이 설정되지 않음

**해결**:
1. Neo4j 서비스에 Volume 추가 (Mount Path: `/data`)
2. 서비스 재배포

### Neo4j 연결 실패

1. **Private Network 확인**: Railway에서 두 서비스가 같은 프로젝트에 있는지 확인
2. **환경변수 확인**: `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` 정확한지 확인
3. **Neo4j 상태 확인**: Neo4j 서비스가 정상 실행 중인지 확인

### Volume 권한 오류

**증상**: `Permission denied` 에러 발생

**해결**: 환경변수에 `RAILWAY_RUN_UID=0` 추가

### 벡터 인덱스 생성 실패

Neo4j Community Edition은 벡터 인덱스를 지원하지 않습니다.
- **해결 방법**: Neo4j Aura 무료 티어 사용 또는 Enterprise Edition 사용
- **대안**: 벡터 검색 없이 일반 그래프 쿼리만 사용

### 메모리 부족

Railway 무료 티어는 메모리가 제한적입니다.
- Neo4j 메모리 설정 조정: `NEO4J_dbms_memory_heap_max__size=512m`
- 또는 Railway Pro 플랜 사용
