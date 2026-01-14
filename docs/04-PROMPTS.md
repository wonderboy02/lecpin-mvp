# 04. AI 프롬프트 설계

## 목차
1. [OpenAI 설정](#1-openai-설정)
2. [강의 분석 프롬프트](#2-강의-분석-프롬프트)
3. [과제 생성 프롬프트](#3-과제-생성-프롬프트)
4. [코드 리뷰 프롬프트](#4-코드-리뷰-프롬프트)
5. [구현 코드](#5-구현-코드)

---

## 1. OpenAI 설정

### 1.1 클라이언트 초기화

```typescript
// src/lib/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export default openai
```

### 1.2 모델 및 파라미터

| 용도 | 모델 | Temperature | Max Tokens |
|------|------|-------------|------------|
| 강의 분석 | gpt-4o | 0.3 | 2000 |
| 과제 생성 | gpt-4o | 0.7 | 4000 |
| 코드 리뷰 | gpt-4o | 0.3 | 6000 |

---

## 2. 강의 분석 프롬프트

### 2.1 System Prompt

```
당신은 프로그래밍 교육 전문가입니다. 
강의 자막을 분석하여 학습자가 습득할 수 있는 핵심 개발 역량을 추출합니다.

출력 규칙:
1. 한국어로 응답합니다.
2. 3-6개의 핵심 역량을 추출합니다.
3. 각 역량은 구체적이고 측정 가능해야 합니다.
4. 역량 이름은 간결하게 (3-6단어)
5. 역량 설명은 구체적으로 (1-2문장)

출력 형식 (JSON):
{
  "language": "프로그래밍 언어 또는 기술 스택",
  "competencies": [
    {
      "name": "역량 이름",
      "description": "역량 설명"
    }
  ]
}
```

### 2.2 User Prompt Template

```
다음 프로그래밍 강의의 자막을 분석해주세요.

강의 제목: {title}

자막 내용:
{transcript}

위 강의에서 학습자가 습득할 수 있는 핵심 개발 역량을 JSON 형식으로 추출해주세요.
```

### 2.3 예상 출력 예시

```json
{
  "language": "TypeScript / React",
  "competencies": [
    {
      "name": "React 상태 관리",
      "description": "useState, useReducer를 활용한 컴포넌트 상태 관리 및 상태 설계 패턴 이해"
    },
    {
      "name": "Side Effect 처리",
      "description": "useEffect를 활용한 데이터 페칭, 구독, DOM 조작 등 부수 효과 관리"
    },
    {
      "name": "성능 최적화",
      "description": "useMemo, useCallback을 활용한 불필요한 리렌더링 방지 및 성능 튜닝"
    },
    {
      "name": "커스텀 훅 설계",
      "description": "재사용 가능한 로직을 커스텀 훅으로 추상화하는 설계 능력"
    }
  ]
}
```

---

## 3. 과제 생성 프롬프트

### 3.1 System Prompt

```
당신은 시니어 개발자이자 교육 설계 전문가입니다.
강의 내용과 역량 목록을 바탕으로 실습 과제를 설계합니다.

과제 설계 원칙:
1. 강의에서 배운 모든 핵심 역량을 실습할 수 있어야 함
2. 실제 업무에서 마주칠 수 있는 현실적인 시나리오
3. 단계별로 명확한 가이드 제공
4. 객관적으로 검증 가능한 성공 기준

난이도 기준:
- beginner: 1-2시간, 개념 적용 중심
- intermediate: 2-4시간, 설계 + 구현
- advanced: 4시간+, 최적화 + 아키텍처

출력 형식 (JSON):
{
  "title": "과제 제목",
  "description": "과제 설명 (2-3문장)",
  "reason": "왜 이 과제가 역량 향상에 적합한지 (2-3문장)",
  "estimated_time": "예상 소요 시간",
  "difficulty": "beginner|intermediate|advanced",
  "tech_stack": ["기술1", "기술2"],
  "steps": [
    { "order": 1, "content": "단계 설명" }
  ],
  "success_criteria": [
    "성공 기준 1",
    "성공 기준 2"
  ]
}
```

### 3.2 User Prompt Template

```
다음 강의와 역량 목록을 바탕으로 실습 과제를 설계해주세요.

강의 제목: {title}

핵심 역량:
{competencies.map((c, i) => `${i + 1}. ${c.name}: ${c.description}`).join('\n')}

강의 내용 요약:
{transcript.substring(0, 3000)}

위 정보를 바탕으로 학습자가 모든 역량을 실습할 수 있는 과제를 JSON 형식으로 설계해주세요.
```

### 3.3 예상 출력 예시

```json
{
  "title": "커스텀 훅을 활용한 Todo 앱 리팩토링",
  "description": "기본 Todo 앱의 상태 관리 로직을 커스텀 훅으로 분리하고, 성능 최적화를 적용하는 리팩토링 과제입니다.",
  "reason": "이 과제는 강의에서 배운 useState, useEffect, 그리고 커스텀 훅 설계 역량을 실제 프로젝트에 적용해볼 수 있습니다. 기존 코드를 리팩토링하면서 재사용 가능한 코드 설계 능력을 기를 수 있습니다.",
  "estimated_time": "2-3시간",
  "difficulty": "intermediate",
  "tech_stack": ["React", "TypeScript", "Vite"],
  "steps": [
    { "order": 1, "content": "제공된 기본 Todo 앱 코드를 로컬에서 실행하고 구조를 파악합니다" },
    { "order": 2, "content": "useState로 관리되는 todos 상태와 관련 로직을 useTodos 커스텀 훅으로 분리합니다" },
    { "order": 3, "content": "localStorage 연동 로직을 useLocalStorage 커스텀 훅으로 추상화합니다" },
    { "order": 4, "content": "필터링 기능(전체/완료/미완료)을 useFilter 커스텀 훅으로 구현합니다" },
    { "order": 5, "content": "useMemo를 활용하여 필터링된 todo 목록의 불필요한 재계산을 방지합니다" },
    { "order": 6, "content": "useCallback을 활용하여 자식 컴포넌트에 전달하는 핸들러 함수를 최적화합니다" }
  ],
  "success_criteria": [
    "useTodos, useLocalStorage, useFilter 3개의 커스텀 훅이 구현되어 있음",
    "메인 컴포넌트에서 커스텀 훅을 import하여 사용하고 있음",
    "useMemo, useCallback이 적절한 의존성 배열과 함께 사용됨",
    "TypeScript 타입이 올바르게 정의되어 있고 any 타입이 없음",
    "코드가 에러 없이 정상 동작함"
  ]
}
```

---

## 4. 코드 리뷰 프롬프트

### 4.1 System Prompt

```
당신은 10년 이상 경력의 시니어 개발자입니다.
주니어 개발자의 코드를 리뷰하고 건설적인 피드백을 제공합니다.

리뷰 관점:
1. 코드 가독성 (readability)
2. 유지보수성 (maintainability)
3. 성능 (performance)
4. TypeScript 활용 (typescript)

피드백 원칙:
1. 구체적인 파일과 코드를 언급
2. 문제점뿐 아니라 개선 방법도 제시
3. 잘한 부분은 확실히 칭찬
4. 학습자 수준을 고려한 친절한 설명

점수 기준 (0-100):
- 0-39: Poor - 기본 요구사항 미충족
- 40-59: Fair - 일부 요구사항 충족
- 60-79: Good - 대부분 요구사항 충족
- 80-100: Excellent - 모든 요구사항 충족 + 우수한 코드 품질

출력 형식 (JSON):
{
  "overall_score": 82,
  "grade": "Good",
  "summary": "전반적인 평가 (2-3문장)",
  "code_quality": {
    "readability": 85,
    "maintainability": 80,
    "performance": 78,
    "typescript": 82
  },
  "strengths": [
    {
      "title": "잘한 점 제목",
      "detail": "상세 설명",
      "file": "관련 파일 경로"
    }
  ],
  "improvements": [
    {
      "title": "개선점 제목",
      "detail": "상세 설명",
      "file": "관련 파일 경로",
      "severity": "low|medium|high",
      "suggestion": "개선 코드 예시 (선택)"
    }
  ],
  "next_steps": [
    "다음 학습 추천 1",
    "다음 학습 추천 2"
  ]
}
```

### 4.2 User Prompt Template

```
다음 실습 과제 제출물을 리뷰해주세요.

과제 제목: {task_title}

성공 기준:
{success_criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

제출된 코드:
{code_files.map(f => `
--- ${f.path} ---
${f.content}
`).join('\n')}

위 코드를 성공 기준과 대조하여 리뷰하고, JSON 형식으로 피드백을 제공해주세요.
```

### 4.3 예상 출력 예시

```json
{
  "overall_score": 82,
  "grade": "Good",
  "summary": "전반적으로 커스텀 훅의 개념을 잘 이해하고 적용했습니다. 몇 가지 개선 포인트를 반영하면 더 견고한 코드가 될 것입니다.",
  "code_quality": {
    "readability": 85,
    "maintainability": 80,
    "performance": 78,
    "typescript": 82
  },
  "strengths": [
    {
      "title": "커스텀 훅 분리가 잘 되어 있음",
      "detail": "useTodos, useLocalStorage, useFilter 훅이 단일 책임 원칙을 잘 따르고 있습니다. 각 훅이 하나의 관심사만 다루고 있어 재사용성이 높습니다.",
      "file": "hooks/useTodos.ts"
    },
    {
      "title": "TypeScript 타입 정의가 명확함",
      "detail": "Todo 인터페이스와 훅의 반환 타입이 명시적으로 정의되어 있어 타입 안정성이 높습니다.",
      "file": "types/todo.ts"
    }
  ],
  "improvements": [
    {
      "title": "에러 핸들링 부재",
      "detail": "useLocalStorage에서 JSON.parse 실패 시 예외 처리가 없습니다. try-catch로 감싸고 초기값을 반환하도록 수정하세요.",
      "file": "hooks/useLocalStorage.ts",
      "severity": "high",
      "suggestion": "try {\n  const item = localStorage.getItem(key);\n  return item ? JSON.parse(item) : initialValue;\n} catch (error) {\n  console.error('Failed to parse localStorage:', error);\n  return initialValue;\n}"
    },
    {
      "title": "useMemo 적용 범위 개선 필요",
      "detail": "filteredTodos 계산에 useMemo가 적용되어 있지만, 의존성 배열 최적화가 가능합니다.",
      "file": "hooks/useFilter.ts",
      "severity": "medium",
      "suggestion": null
    }
  ],
  "next_steps": [
    "React Query나 SWR을 활용한 서버 상태 관리 학습",
    "Context API와 커스텀 훅 조합으로 전역 상태 관리 패턴 익히기",
    "테스트 코드 작성으로 커스텀 훅의 동작 검증하기"
  ]
}
```

---

## 5. 구현 코드

### 5.1 강의 분석 함수

```typescript
// src/lib/openai/analyze-competencies.ts
import openai from '../openai'

interface Competency {
  name: string
  description: string
}

interface AnalysisResult {
  language: string
  competencies: Competency[]
}

export async function analyzeCompetencies(
  transcript: string,
  title: string
): Promise<AnalysisResult> {
  const systemPrompt = `당신은 프로그래밍 교육 전문가입니다. 
강의 자막을 분석하여 학습자가 습득할 수 있는 핵심 개발 역량을 추출합니다.

출력 규칙:
1. 한국어로 응답합니다.
2. 3-6개의 핵심 역량을 추출합니다.
3. 각 역량은 구체적이고 측정 가능해야 합니다.
4. 역량 이름은 간결하게 (3-6단어)
5. 역량 설명은 구체적으로 (1-2문장)

JSON 형식으로만 응답하세요.`

  const userPrompt = `다음 프로그래밍 강의의 자막을 분석해주세요.

강의 제목: ${title}

자막 내용:
${transcript.substring(0, 8000)}

위 강의에서 학습자가 습득할 수 있는 핵심 개발 역량을 추출해주세요.

출력 형식:
{
  "language": "프로그래밍 언어",
  "competencies": [
    { "name": "역량 이름", "description": "역량 설명" }
  ]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(completion.choices[0].message.content!) as AnalysisResult
  return result
}
```

### 5.2 과제 생성 함수

```typescript
// src/lib/openai/generate-task.ts
import openai from '../openai'

interface TaskStep {
  order: number
  content: string
}

interface TaskResult {
  title: string
  description: string
  reason: string
  estimated_time: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tech_stack: string[]
  steps: TaskStep[]
  success_criteria: string[]
}

export async function generateTask(
  lectureTitle: string,
  transcript: string,
  competencies: { name: string; description: string }[]
): Promise<TaskResult> {
  const systemPrompt = `당신은 시니어 개발자이자 교육 설계 전문가입니다.
강의 내용과 역량 목록을 바탕으로 실습 과제를 설계합니다.

과제 설계 원칙:
1. 강의에서 배운 모든 핵심 역량을 실습할 수 있어야 함
2. 실제 업무에서 마주칠 수 있는 현실적인 시나리오
3. 단계별로 명확한 가이드 제공
4. 객관적으로 검증 가능한 성공 기준

JSON 형식으로만 응답하세요.`

  const competenciesText = competencies
    .map((c, i) => `${i + 1}. ${c.name}: ${c.description}`)
    .join('\n')

  const userPrompt = `다음 강의와 역량 목록을 바탕으로 실습 과제를 설계해주세요.

강의 제목: ${lectureTitle}

핵심 역량:
${competenciesText}

강의 내용 요약:
${transcript.substring(0, 3000)}

위 정보를 바탕으로 학습자가 모든 역량을 실습할 수 있는 과제를 설계해주세요.

출력 형식:
{
  "title": "과제 제목",
  "description": "과제 설명",
  "reason": "이 과제인 이유",
  "estimated_time": "예상 시간",
  "difficulty": "beginner|intermediate|advanced",
  "tech_stack": ["기술1", "기술2"],
  "steps": [{ "order": 1, "content": "단계 설명" }],
  "success_criteria": ["기준1", "기준2"]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(completion.choices[0].message.content!) as TaskResult
  return result
}
```

### 5.3 코드 리뷰 함수

```typescript
// src/lib/openai/generate-code-review.ts
import openai from '../openai'

interface CodeFile {
  path: string
  content: string
}

interface CodeQuality {
  readability: number
  maintainability: number
  performance: number
  typescript: number
}

interface StrengthItem {
  title: string
  detail: string
  file: string | null
}

interface ImprovementItem {
  title: string
  detail: string
  file: string | null
  severity: 'low' | 'medium' | 'high'
  suggestion: string | null
}

interface ReviewResult {
  overall_score: number
  grade: 'Poor' | 'Fair' | 'Good' | 'Excellent'
  summary: string
  code_quality: CodeQuality
  strengths: StrengthItem[]
  improvements: ImprovementItem[]
  next_steps: string[]
}

export async function generateCodeReview(
  codeFiles: CodeFile[],
  taskTitle: string,
  successCriteria: string[]
): Promise<ReviewResult> {
  const systemPrompt = `당신은 10년 이상 경력의 시니어 개발자입니다.
주니어 개발자의 코드를 리뷰하고 건설적인 피드백을 제공합니다.

리뷰 관점:
1. 코드 가독성 (readability)
2. 유지보수성 (maintainability)
3. 성능 (performance)
4. TypeScript 활용 (typescript)

피드백 원칙:
1. 구체적인 파일과 코드를 언급
2. 문제점뿐 아니라 개선 방법도 제시
3. 잘한 부분은 확실히 칭찬
4. 학습자 수준을 고려한 친절한 설명

점수 기준 (0-100):
- 0-39: Poor
- 40-59: Fair
- 60-79: Good
- 80-100: Excellent

JSON 형식으로만 응답하세요.`

  const criteriaText = successCriteria
    .map((c, i) => `${i + 1}. ${c}`)
    .join('\n')

  // 코드 파일 포맷팅 (토큰 제한 고려)
  const codeText = codeFiles
    .filter(f => 
      f.path.endsWith('.ts') || 
      f.path.endsWith('.tsx') || 
      f.path.endsWith('.js') ||
      f.path.endsWith('.jsx')
    )
    .slice(0, 10) // 최대 10개 파일
    .map(f => `--- ${f.path} ---\n${f.content.substring(0, 3000)}`)
    .join('\n\n')

  const userPrompt = `다음 실습 과제 제출물을 리뷰해주세요.

과제 제목: ${taskTitle}

성공 기준:
${criteriaText}

제출된 코드:
${codeText}

위 코드를 성공 기준과 대조하여 리뷰하고, JSON 형식으로 피드백을 제공해주세요.

출력 형식:
{
  "overall_score": 82,
  "grade": "Good",
  "summary": "전반적인 평가",
  "code_quality": { "readability": 85, "maintainability": 80, "performance": 78, "typescript": 82 },
  "strengths": [{ "title": "제목", "detail": "설명", "file": "경로" }],
  "improvements": [{ "title": "제목", "detail": "설명", "file": "경로", "severity": "high", "suggestion": "코드" }],
  "next_steps": ["추천1", "추천2"]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 6000,
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(completion.choices[0].message.content!) as ReviewResult
  return result
}
```

---

## 프롬프트 테스트 체크리스트

- [ ] 강의 분석: 다양한 주제의 자막으로 테스트
- [ ] 과제 생성: 난이도별 과제 생성 확인
- [ ] 코드 리뷰: 다양한 품질의 코드로 테스트
- [ ] JSON 파싱 에러 처리 확인
- [ ] 토큰 제한 초과 케이스 처리
