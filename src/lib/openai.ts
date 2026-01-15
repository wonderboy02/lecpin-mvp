import OpenAI from 'openai'
import type { Language } from '@/types'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 모델 상수
export const CODE_REVIEW_MODEL = 'gpt-5.1-codex-max' // 코드 리뷰 전용 (Responses API)
export const GENERAL_MODEL = 'gpt-4o' // 일반 작업용 (Chat Completions API)

// 과제 제목을 영어 프로젝트명으로 변환
export async function translateToProjectName(title: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: GENERAL_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a project naming expert. Convert the given title to a short, clean English project name suitable for a GitHub repository.

Rules:
- Output ONLY the project name, nothing else
- Use lowercase letters and hyphens only
- Maximum 25 characters
- Make it concise but descriptive
- If already in English, just clean it up
- Examples:
  - "알고리즘 기초 실습" → "algorithm-basics"
  - "React Todo App 만들기" → "react-todo-app"
  - "Week 1 과제" → "week1-assignment"`,
        },
        {
          role: 'user',
          content: title,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    })

    const projectName = response.choices[0]?.message?.content?.trim() || ''

    // 결과 정리: 소문자, 영문/숫자/하이픈만 허용, 연속 하이픈 제거
    return projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 25)
  } catch (error) {
    console.error('Project name translation error:', error)
    // 실패 시 fallback: 영문/숫자만 추출
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 25) || 'project'
  }
}

// 코드 길이에 따른 reasoning effort 결정
// SDK v4.104.0 기준: 'low' | 'medium' | 'high' 지원
function getReasoningEffort(codeLength: number): 'medium' | 'high' {
  if (codeLength < 10000) return 'medium'
  return 'high'
}

// 이전 피드백 타입
interface PreviousFeedback {
  attemptNumber: number
  overallScore: number
  summary: string
  improvements: Array<{ title: string; detail: string }>
}

// Responses API를 사용한 코드 리뷰 함수
// 반환 타입은 JSON.parse 결과이므로 supabase Json 타입과 호환됨
export async function reviewCodeWithCodex(params: {
  code: string
  taskInfo: string
  language: Language
  previousFeedbacks?: PreviousFeedback[]
}) {
  const { code, taskInfo, language, previousFeedbacks = [] } = params
  const effort = getReasoningEffort(code.length)
  const languageInstruction = getLanguageInstruction(language)

  // 이전 피드백이 있으면 컨텍스트로 추가
  let previousFeedbackContext = ''
  if (previousFeedbacks.length > 0) {
    const feedbackSummaries = previousFeedbacks.map(f =>
      `- ${f.attemptNumber}차 시도: ${f.overallScore}점
  요약: ${f.summary}
  주요 개선점: ${f.improvements.slice(0, 3).map(i => i.title).join(', ')}`
    ).join('\n')

    previousFeedbackContext = `
이전 시도 히스토리:
${feedbackSummaries}

위 이전 피드백을 참고하여:
1. 이전에 지적한 개선점이 수정되었는지 확인하고 언급
2. 새로 발생한 문제점도 함께 지적
3. 점수 변화의 이유를 summary에 포함
`
  }

  const input = `${CODE_REVIEW_PROMPT}

${languageInstruction}

${taskInfo}
${previousFeedbackContext}
제출된 코드:
${code}`

  // Responses API 호출
  const result = await openai.responses.create({
    model: CODE_REVIEW_MODEL,
    input,
    reasoning: { effort },
  })

  // output_text에서 JSON 파싱 (any 타입으로 반환되어 supabase와 호환)
  const parsed = JSON.parse(result.output_text)

  return {
    overall_score: parsed.overall_score || 70,
    grade: parsed.grade || 'Fair',
    summary: parsed.summary || '코드 리뷰가 완료되었습니다.',
    code_quality: parsed.code_quality || {
      readability: 70,
      maintainability: 70,
      correctness: 70,
      best_practices: 70,
    },
    strengths: parsed.strengths || [],
    improvements: parsed.improvements || [],
    next_steps: parsed.next_steps || [],
  }
}

// 언어별 시스템 프롬프트 프리픽스
export function getLanguageInstruction(language: Language = 'ko'): string {
  return language === 'ko'
    ? '모든 응답을 한국어로 작성해주세요.'
    : 'Please write all responses in English.'
}

// 역량 분석 프롬프트
export const COMPETENCY_ANALYSIS_PROMPT = `당신은 프로그래밍 교육 전문가입니다. 제공된 프로그래밍 강의 자막을 분석하여 학습자가 습득해야 할 핵심 역량을 추출해주세요.

다음 형식의 JSON으로 응답해주세요:
{
  "title": "강의 제목 (자막 내용에서 추론)",
  "language": "주요 프로그래밍 언어 (예: TypeScript, Python, JavaScript)",
  "competencies": [
    {
      "name": "역량 이름 (간결하게)",
      "description": "이 역량이 무엇이고 왜 중요한지 2-3문장으로 설명"
    }
  ]
}

규칙:
- 역량은 3~6개 사이로 추출
- 각 역량은 구체적이고 측정 가능해야 함
- 강의에서 실제로 다루는 내용만 포함
- 일반적인 역량(문제 해결 능력 등)보다 기술적 역량 위주로 추출
- JSON 외 다른 텍스트 출력 금지`

// 과제 생성 프롬프트
export const TASK_GENERATION_PROMPT = `당신은 프로그래밍 교육 과제 설계 전문가입니다. 제공된 강의 정보와 핵심 역량을 바탕으로 실습 과제를 생성해주세요.

다음 형식의 JSON으로 응답해주세요:
{
  "title": "과제 제목",
  "description": "과제 전체 설명 (학습자가 무엇을 만들지 명확하게)",
  "reason": "이 과제가 해당 역량 학습에 효과적인 이유",
  "difficulty": "beginner | intermediate | advanced",
  "estimated_time": "예상 소요 시간 (예: 2-3시간)",
  "tech_stack": ["사용할 기술/라이브러리 목록"],
  "steps": [
    {
      "order": 1,
      "title": "단계 제목",
      "content": "이 단계에서 해야 할 일 상세 설명"
    }
  ],
  "success_criteria": [
    "완료 기준 1",
    "완료 기준 2"
  ]
}

규칙:
- 과제는 실제로 구현 가능한 미니 프로젝트여야 함
- 단계는 5~8개 사이
- 각 단계는 명확하고 실행 가능해야 함
- 성공 기준은 3~5개
- 학습자 수준에 맞는 난이도 설정
- JSON 외 다른 텍스트 출력 금지

중요 - 코드 범위 제한:
- 과제는 핵심 파일 3~5개 이내로 완성할 수 있어야 함
- 불필요하게 많은 파일을 만들도록 유도하지 말 것
- 프레임워크 보일러플레이트 제외, 실제 작성해야 할 코드는 총 300줄 이내 권장
- 하나의 핵심 기능에 집중하는 과제 설계
- 복잡한 프로젝트 구조보다 학습 목표에 맞는 최소한의 구현을 요구할 것`

// 코드 리뷰 프롬프트
export const CODE_REVIEW_PROMPT = `당신은 시니어 소프트웨어 엔지니어이자 멘토입니다. 제출된 코드를 리뷰하고 건설적인 피드백을 제공해주세요.

다음 형식의 JSON으로 응답해주세요:
{
  "overall_score": 0-100 사이 점수,
  "grade": "Poor | Fair | Good | Excellent",
  "summary": "전체적인 코드 품질에 대한 2-3문장 요약",
  "code_quality": {
    "readability": 0-100,
    "maintainability": 0-100,
    "correctness": 0-100,
    "best_practices": 0-100
  },
  "strengths": [
    {
      "title": "강점 제목",
      "detail": "구체적인 설명",
      "file": "해당 파일 경로 (있다면)"
    }
  ],
  "improvements": [
    {
      "title": "개선점 제목",
      "detail": "문제 설명",
      "file": "해당 파일 경로",
      "severity": "critical | major | minor | suggestion",
      "suggestion": "구체적인 개선 방법"
    }
  ],
  "next_steps": [
    "다음 학습 단계 추천 1",
    "다음 학습 단계 추천 2"
  ]
}

규칙:
- 건설적이고 교육적인 톤 유지
- 강점은 2-4개, 개선점은 3-6개
- 구체적인 코드 라인이나 패턴 언급
- severity는 문제의 심각도 (critical: 버그/보안, major: 중요한 개선, minor: 사소한 개선, suggestion: 제안)
- 다음 학습 단계는 2-4개
- JSON 외 다른 텍스트 출력 금지`
