# [PRD v1.1] K-Audit: Lean MVP

**핵심 전략**: 복잡한 루프를 제거하고, **'데이터 격차에 따른 점수 차이'**를 시각화하는 데 집중합니다.

## 1. 수정된 핵심 기능 (Functional Requirements)

### 1.1. GraphRAG 기반 지식 베이스 (MVP)

- **Neo4j Schema**: `(Concept {name}) -[:RELATED_TO]-> (Concept)`.
- **Ingestion**: 강의 텍스트에서 핵심 엔티티를 추출하여 관계를 맺고, 각 노드에 해당 지식의 벡터 임베딩을 저장합니다.
- **Learner State**: 학습자가 공부한 부분만 Neo4j의 특정 속성(`is_learned: true`)이나 별도의 Learner 노드로 연결합니다.

### 1.2. 벤치마크 & 솔버 (MVP)

- **Multi-Exam Gen**: 강의 그래프의 중심성(Centrality)이 높은 노드들을 기반으로 3~5개의 문제를 생성합니다.
- **Differential Solver**:
  * **Task A**: 전체 강의 그래프를 참고하여 문제 풀이 → Base Score ($S_{max}$)
  * **Task B**: 학습 완료 표시된 그래프만 참고하여 문제 풀이 → Learner Score ($S_{user}$)
  * **참고**: 이때 수사관 루프 대신 **"답변 시 반드시 참고한 노드 이름을 나열하라"**는 프롬프트 제약만 둡니다.

### 1.3. 스코어링 및 대시보드

- 단순 점수 비교 및 지식 습득률 시각화.
- **Score Gap Analysis**: "전체 지식 중 어느 부분에서 점수 차이가 발생하는가?"를 그래프 상에서 하이라이트.

## 2. 수정된 로드맵 (Roadmap)

### Phase 1: Foundation (기반 구축)

- **Next.js + Neo4j 연동**: Railway에 Next.js 배포 및 Neo4j AuraDB 연결.
- **Graph Ingestion**: PDF/Text 데이터를 Neo4j 노드와 관계로 변환하는 파이프라인 구축.
- **Vector Search**: Neo4j의 벡터 인덱스를 활용한 기본 RAG 구현.

### Phase 2: MVP Core (핵심 가치 검증)

- **Multi-Agent Workflow (LangGraph)**:
  1. 문제 생성 노드
  2. 전체 DB 솔버 노드
  3. 학습자 DB 솔버 노드
  4. 결과 비교/채점 노드
- **UI 개발**: 실시간 에이전트 진행 상황 스트리밍 및 결과 그래프 대시보드.

### Phase 3: Optimization (수사관 도입 - 선택 사항)

- **Auditor Agent 추가**: MVP 결과에서 "LLM 상식 때문에 점수 변별력이 없다"고 판단될 경우, 우리가 논의한 역질문 및 근거 매칭 루프를 LangGraph의 조건부 엣지로 추가.
- **성능 튜닝**: GraphRAG 검색 알고리즘 고도화 (Hybrid Search 등).

## 3. 기술 스택 요약 (Monolith)

- **App Framework**: Next.js 15 (Railway 배포)
- **Graph DB**: Neo4j (GraphRAG 핵심)
- **Orchestrator**: LangGraph.js (선형 워크플로우로 시작)
- **Evaluation**: RAGAS 또는 기본 LLM-as-a-judge 채점 로직

## 4. 비판적 피드백: 수사관 로직 없이 '상식'을 막는 법

수사관 로직을 뒤로 미루는 대신, MVP에서 성능을 확보하기 위해 다음의 **'가성비 로직'**을 제안합니다.

- **고유 명사 치환 (De-identification)**: 벤치마크 문제를 낼 때 리눅스의 실제 용어 대신 강의 내에서만 정의된 가상의 용어나 기호로 치환해서 문제를 내게 합니다. (예: Kernel -> Core-K) 이렇게 하면 LLM이 상식으로 풀고 싶어도 못 풀게 됩니다.
- **Negative Constraints**: 솔버에게 "너는 이 지식 외에는 아무것도 모르는 깡통 로봇이다"라는 페르소나를 강력하게 부여합니다.