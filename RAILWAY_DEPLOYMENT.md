# Railway 배포 가이드

이 프로젝트는 **Next.js 앱**과 **Neo4j 데이터베이스**를 Railway에 별도 서비스로 배포합니다.

## 사전 준비

- Railway 계정 (https://railway.app)
- GitHub 레포지토리 연결
- OpenAI API Key

## 배포 아키텍처

```
Railway Project
├── Next.js 서비스 (Dockerfile 사용)
│   └── 환경변수: NEO4J_URI, OPENAI_API_KEY 등
└── Neo4j 서비스 (템플릿 사용)
    └── Volume: /data (데이터 영구 보존)

통신: bolt://neo4j.railway.internal:7687 (Private Network)
```

---

## 1. Next.js 앱 배포

### 1.1. GitHub 레포지토리 연결

1. Railway 대시보드 → **New Project**
2. **Deploy from GitHub repo** 선택
3. 레포지토리 선택 및 권한 부여
4. Railway가 자동으로 Dockerfile을 감지하여 빌드 시작

### 1.2. railway.json 설정 확인

프로젝트에 `railway.json` 파일이 있어야 합니다:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**중요:** `builder`가 `"DOCKERFILE"`로 설정되어야 Dockerfile을 사용합니다!

### 1.3. Dockerfile 빌드 인수 설정

Dockerfile은 빌드 타임에 환경변수를 받도록 설정되어 있습니다:

```dockerfile
# Railway 환경변수를 빌드 타임에 전달받기
ARG OPENAI_API_KEY
ARG NEO4J_URI
ARG NEO4J_USERNAME
ARG NEO4J_PASSWORD
# ...

# ARG를 ENV로 변환
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEO4J_URI=${NEO4J_URI}
# ...

RUN npm run build
```

Railway는 Variables 탭의 환경변수를 자동으로 `--build-arg`로 전달합니다.

### 1.4. Public Domain 생성

Next.js 서비스 → **Settings** → **Networking**:
- **Generate Domain** 클릭
- `https://your-app-xxx.up.railway.app` 형식의 URL 생성

---

## 2. Neo4j 서비스 배포

### 2.1. Neo4j 템플릿 추가

같은 Railway 프로젝트 내에서:

1. **New** → **Template** 클릭
2. "Neo4j" 검색
3. **sukrutnrvd/neo4j-template** 선택 (권장)
4. **Deploy** 클릭

### 2.2. Neo4j 환경변수 설정

템플릿 배포 시:

```bash
# 필수 (최소 8자 이상)
DB_PASSWORD=YourStrongPassword123!

# 선택 (Hobby Plan이면 기본값 사용)
HEAP_INITIAL_SIZE=1g
HEAP_MAX_SIZE=1g
PAGECACHE_SIZE=4g
NEO4J_PLUGINS=["apoc"]
```

**중요:** `DB_PASSWORD`를 기억해두세요! Next.js 앱에서 사용합니다.

### 2.3. Volume 설정 (필수!)

Neo4j 서비스 배포 후:

1. Neo4j 서비스 선택
2. **Settings** → **Volumes** 탭
3. Volume이 `/data`에 마운트되어 있는지 확인
   - 템플릿을 사용하면 자동으로 생성되어야 함
   - 없으면: `⌘K` (Mac) 또는 `Ctrl+K` (Windows) → "Create Volume"
   - **Mount Path:** `/data`

**Volume이 없으면 컨테이너 재시작 시 모든 데이터가 삭제됩니다!**

### 2.4. Private Networking 확인

Neo4j 서비스 → **Settings** → **Networking**:
- **Private Networking** 활성화 확인
- 포트 **7687** (Bolt) 노출 확인

---

## 3. Next.js 환경변수 설정

Neo4j가 정상적으로 실행된 후, Next.js 서비스에 환경변수를 추가합니다.

Railway 대시보드 → **Next.js 서비스** → **Variables** 탭:

```bash
# Neo4j 연결 (Private Network 사용)
NEO4J_URI=bolt://neo4j.railway.internal:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=YourStrongPassword123!

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# LangSmith (선택 사항)
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=lecpin-mvp

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

**중요 사항:**
- `NEO4J_PASSWORD`는 Neo4j의 `DB_PASSWORD`와 **동일**해야 합니다!
- `NEO4J_URI`는 `bolt://neo4j.railway.internal:7687` 형식
  - `neo4j.railway.internal`: Railway의 Private Network DNS
  - `bolt://`: 암호화 없는 연결 (Private Network에서는 안전)

환경변수 추가 후 자동으로 재배포됩니다.

---

## 4. Neo4j 스키마 초기화

### 4.1. Neo4j Browser 접속

1. Railway 대시보드 → Neo4j 서비스
2. **Networking** → Public URL 복사
3. 브라우저에서 Neo4j Browser 열기
4. 로그인:
   - Username: `neo4j`
   - Password: `YourStrongPassword123!` (DB_PASSWORD)

### 4.2. 스키마 실행

`scripts/neo4j-init/01-schema.cypher` 파일의 내용을 Neo4j Browser에서 실행:

```cypher
// 제약조건 생성
CREATE CONSTRAINT concept_name_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.name IS UNIQUE;

// 인덱스 생성
CREATE INDEX concept_name_index IF NOT EXISTS
FOR (c:Concept) ON (c.name);

// ... 나머지 스키마
```

또는 API를 통해 초기화 (선택):

```bash
curl -X POST https://your-app.railway.app/api/neo4j/init
```

---

## 5. 배포 확인

### 5.1. Next.js 앱 접속

```
https://your-app-xxx.up.railway.app
```

### 5.2. Neo4j 연결 테스트

```bash
curl https://your-app.railway.app/api/concepts
```

정상 응답:
```json
{
  "concepts": []
}
```

에러 응답:
```json
{
  "error": "개념 목록 조회 중 오류가 발생했습니다",
  "details": "..."
}
```

---

## 로컬 개발 환경

로컬에서는 **Docker Compose**를 사용합니다:

### 로컬 실행 방법

```bash
# Neo4j + Next.js 모두 Docker로 실행
docker-compose up -d

# 또는 Neo4j만 Docker, Next.js는 로컬에서 실행
docker-compose up -d neo4j
npm run dev
```

### 로컬 환경변수 (.env.local)

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=localpassword123
OPENAI_API_KEY=sk-your-api-key
```

---

## 트러블슈팅

### 1. "next: not found" 에러

**증상:** Railway 배포 시 "sh: next: not found" 에러

**원인:** `railway.json`에서 builder가 NIXPACKS로 설정되어 있음

**해결:**
```json
{
  "build": {
    "builder": "DOCKERFILE"  // ← NIXPACKS를 DOCKERFILE로 변경
  }
}
```

### 2. "OPENAI_API_KEY environment variable is missing" (빌드 시)

**증상:** Docker 빌드 중 환경변수 없음 에러

**원인:** Railway Variables가 빌드 타임에 전달되지 않음

**해결:** Dockerfile에 ARG 추가 (이미 설정되어 있음)
```dockerfile
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
```

### 3. Neo4j 연결 실패 - "Failed to connect to server"

**증상:**
```
Failed to connect to server... encryption settings...
```

**원인:** 암호화 설정 불일치

**해결:** `src/lib/neo4j.ts`에서 암호화 옵션 명시 (이미 설정되어 있음)
```typescript
const config = isProduction
  ? { encrypted: false }  // Private Network에서는 암호화 불필요
  : {};

driver = neo4j.driver(uri, neo4j.auth.basic(username, password), config);
```

**추가 체크:**
- Neo4j 서비스가 Running 상태인지 확인
- `NEO4J_PASSWORD`와 Neo4j의 `DB_PASSWORD`가 일치하는지 확인
- `NEO4J_URI`가 `bolt://neo4j.railway.internal:7687` 형식인지 확인

### 4. "/app/public not found" (빌드 시)

**증상:** Docker 빌드 중 public 폴더를 찾을 수 없음

**해결:** Dockerfile에서 빌드 후 public 폴더 생성 (이미 설정되어 있음)
```dockerfile
RUN npm run build
RUN mkdir -p public  # ← public 폴더 생성
```

### 5. 데이터가 사라지는 문제

**증상:** 컨테이너 재시작 후 Neo4j 데이터가 초기화됨

**원인:** Volume이 설정되지 않음

**해결:**
1. Neo4j 서비스 → **Settings** → **Volumes**
2. Volume이 `/data`에 마운트되어 있는지 확인
3. 없으면 Volume 생성 후 서비스 재배포

### 6. Volume 권한 오류

**증상:** `Permission denied` 에러 발생

**해결:** Neo4j 환경변수에 추가
```bash
RAILWAY_RUN_UID=0
```

### 7. 메모리 부족

**증상:** Neo4j가 OOM(Out of Memory)으로 크래시

**해결:** Railway Hobby Plan에서는 메모리 제한적
- Neo4j 메모리 설정 낮추기:
  ```bash
  HEAP_MAX_SIZE=512m
  PAGECACHE_SIZE=512m
  ```
- 또는 Railway Pro 플랜 사용

---

## 참고 사항

### Railway vs Docker Compose

- **로컬 개발:** `docker-compose.yml` 사용
  - Neo4j와 Next.js가 하나의 네트워크에서 통신
  - 컨테이너 이름으로 연결: `bolt://neo4j:7687`

- **Railway 프로덕션:** 서비스 분리
  - Neo4j와 Next.js가 별도 서비스로 배포
  - Private Network로 통신: `bolt://neo4j.railway.internal:7687`

### 비용 최적화

Railway Hobby Plan (무료):
- $5 무료 크레딧/월
- Neo4j + Next.js로 충분히 사용 가능
- Volume은 무료

### 보안

- Private Network 사용으로 Neo4j는 외부에서 접근 불가
- Public URL은 Neo4j Browser 접속용으로만 사용
- 환경변수에 민감 정보 포함 시 Railway Secrets 사용 권장

---

## 추가 리소스

- [Railway 공식 문서](https://docs.railway.app/)
- [Neo4j 공식 문서](https://neo4j.com/docs/)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
