import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END } from '@langchain/langgraph';
import { getHighCentralityConcepts } from './graph-ingestion';
import { generateEmbedding } from './embeddings';
import {
  searchSimilarConcepts,
  vectorIndexExists,
  createVectorIndex,
} from './vector-index';

/**
 * LangGraph State 정의
 */
interface WorkflowState {
  concepts: string[]; // 문제 생성에 사용할 개념들
  questions: string[]; // 생성된 문제들
  baseAnswers: string[]; // 전체 DB 참고한 답변
  learnerAnswers: string[]; // 학습자 DB 참고한 답변
  baseScore: number; // 전체 DB 점수
  learnerScore: number; // 학습자 점수
  scoreGap: number; // 점수 차이
  results: any; // 최종 결과
}

/**
 * 1. 문제 생성 노드 (개선 - 개념 설명 포함, 응용/분석 문제)
 */
async function generateQuestions(
  state: WorkflowState
): Promise<Partial<WorkflowState>> {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    modelKwargs: {
      response_format: { type: 'json_object' },
    },
  });

  console.log('문제 생성 시작...');

  // 중심성이 높은 개념들 (설명 포함)
  const highCentralityConcepts = await getHighCentralityConcepts(5);

  const conceptsWithDesc = highCentralityConcepts
    .map((c) => `${c.name}: ${c.description}`)
    .join('\n');

  const prompt = `
다음 개념들을 기반으로 3개의 문제를 생성하세요.

<개념들>
${conceptsWithDesc}
</개념들>

요구사항:
1. 각 문제는 해당 개념에 대한 깊은 이해를 요구해야 함
2. 단순 암기가 아닌 응용/분석 문제로 구성
3. 문제는 구체적이고 명확해야 함

JSON 형식으로 반환:
{
  "questions": ["문제1", "문제2", "문제3"]
}
  `.trim();

  const response = await llm.invoke(prompt);

  // markdown 코드 블록 제거
  let content = response.content as string;
  content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  const parsed = JSON.parse(content);
  const questions = parsed.questions || parsed;

  console.log(`문제 생성 완료: ${questions.length}개`);

  return {
    concepts: highCentralityConcepts.map((c) => c.name),
    questions,
  };
}

/**
 * 2. 전체 DB 솔버 노드 (Task A - RAG 통합)
 */
async function solveWithFullDB(
  state: WorkflowState
): Promise<Partial<WorkflowState>> {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
  });

  console.log('전체 DB 솔버 시작...');

  const answers: string[] = [];

  for (let i = 0; i < state.questions.length; i++) {
    const question = state.questions[i];

    // 1. 질문 임베딩 생성
    const questionEmbedding = await generateEmbedding(question);

    // 2. 벡터 검색으로 관련 개념 추출 (전체 그래프)
    const relevantConcepts = await searchSimilarConcepts(
      questionEmbedding,
      10, // top 10
      false // 전체 개념
    );

    // 3. 컨텍스트 구성
    const context = relevantConcepts
      .map((c) => `- ${c.name}: ${c.description}`)
      .join('\n');

    // 4. RAG 프롬프트
    const prompt = `
다음 지식 베이스를 참고하여 문제를 풀어주세요.

<지식 베이스>
${context}
</지식 베이스>

문제: ${question}

중요: 반드시 위 지식 베이스에서 참고한 개념의 이름을 명시하세요.

답변 형식:
답: [답변]
참고한 개념: [개념1, 개념2, ...]
    `.trim();

    const response = await llm.invoke(prompt);
    answers.push(response.content as string);
    console.log(`문제 ${i + 1}/${state.questions.length} 풀이 완료 (전체 DB)`);
  }

  return {
    baseAnswers: answers,
  };
}

/**
 * 3. 학습자 DB 솔버 노드 (Task B - RAG 통합, 강력한 제약)
 */
async function solveWithLearnerDB(
  state: WorkflowState
): Promise<Partial<WorkflowState>> {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
  });

  console.log('학습자 DB 솔버 시작...');

  const answers: string[] = [];

  for (let i = 0; i < state.questions.length; i++) {
    const question = state.questions[i];

    // 1. 질문 임베딩 생성
    const questionEmbedding = await generateEmbedding(question);

    // 2. 벡터 검색 (학습한 개념만)
    const relevantConcepts = await searchSimilarConcepts(
      questionEmbedding,
      10,
      true // 학습한 개념만
    );

    // 학습한 개념이 없는 경우
    if (relevantConcepts.length === 0) {
      answers.push('답: 모름\n참고한 개념: 없음');
      console.log(`문제 ${i + 1}/${state.questions.length} - 학습한 개념 없음`);
      continue;
    }

    // 3. 컨텍스트 구성
    const context = relevantConcepts
      .map((c) => `- ${c.name}: ${c.description}`)
      .join('\n');

    // 4. 강력한 제약 프롬프트
    const prompt = `
너는 다음 개념들만 학습한 학생이다. 이 개념들 외에는 아무것도 모르는 깡통 로봇이다.

<학습한 지식>
${context}
</학습한 지식>

문제: ${question}

중요: 학습한 지식만 사용하여 답변하세요. 모르면 "모름"이라고 답하세요.

답변 형식:
답: [답변 또는 "모름"]
참고한 개념: [개념1, 개념2, ...] 또는 "없음"
    `.trim();

    const response = await llm.invoke(prompt);
    answers.push(response.content as string);
    console.log(
      `문제 ${i + 1}/${state.questions.length} 풀이 완료 (학습자 DB)`
    );
  }

  return {
    learnerAnswers: answers,
  };
}

/**
 * 4. 결과 비교/채점 노드 (개선 - 각 문제별 개별 채점)
 */
async function evaluateResults(
  state: WorkflowState
): Promise<Partial<WorkflowState>> {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
    modelKwargs: {
      response_format: { type: 'json_object' },
    },
  });

  console.log('채점 시작...');

  const evaluations = [];

  for (let i = 0; i < state.questions.length; i++) {
    const prompt = `
문제: ${state.questions[i]}

전체 지식 기반 답변:
${state.baseAnswers[i]}

학습자 답변:
${state.learnerAnswers[i]}

다음 기준으로 각 답변을 0-100점으로 채점하세요:
1. 정확성 (50점): 사실적으로 정확한가?
2. 논리성 (30점): 논리적으로 일관된가?
3. 완성도 (20점): 충분히 설명했는가?

JSON 형식:
{
  "questionId": ${i + 1},
  "baseScore": 점수,
  "learnerScore": 점수,
  "baseReasoning": "채점 근거",
  "learnerReasoning": "채점 근거",
  "knowledgeGap": ["부족한 개념1", "부족한 개념2"]
}
    `.trim();

    const response = await llm.invoke(prompt);

    // markdown 코드 블록 제거
    let content = response.content as string;
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    evaluations.push(JSON.parse(content));
    console.log(`문제 ${i + 1}/${state.questions.length} 채점 완료`);
  }

  // 평균 점수 계산
  const avgBase =
    evaluations.reduce((sum, e) => sum + e.baseScore, 0) / evaluations.length;
  const avgLearner =
    evaluations.reduce((sum, e) => sum + e.learnerScore, 0) /
    evaluations.length;

  console.log(
    `채점 완료: 전체 DB ${avgBase.toFixed(1)}점, 학습자 ${avgLearner.toFixed(1)}점`
  );

  return {
    baseScore: avgBase,
    learnerScore: avgLearner,
    scoreGap: avgBase - avgLearner,
    results: {
      evaluations,
      summary: {
        baseScore: avgBase,
        learnerScore: avgLearner,
        scoreGap: avgBase - avgLearner,
        knowledgeGaps: evaluations.flatMap((e) => e.knowledgeGap),
      },
    },
  };
}

/**
 * LangGraph 워크플로우 생성
 */
export function createWorkflow() {
  const workflow = new StateGraph<WorkflowState>({
    channels: {
      concepts: null,
      questions: null,
      baseAnswers: null,
      learnerAnswers: null,
      baseScore: null,
      learnerScore: null,
      scoreGap: null,
      results: null,
    },
  });

  // 노드 추가
  workflow.addNode('generate_questions', generateQuestions);
  workflow.addNode('solve_with_full_db', solveWithFullDB);
  workflow.addNode('solve_with_learner_db', solveWithLearnerDB);
  workflow.addNode('evaluate', evaluateResults);

  // 엣지 추가 (선형 워크플로우)
  // @ts-expect-error - LangGraph 타입 추론 이슈, 런타임에는 정상 동작
  workflow.addEdge('__start__', 'generate_questions');
  // @ts-expect-error - LangGraph 타입 추론 이슈, 런타임에는 정상 동작
  workflow.addEdge('generate_questions', 'solve_with_full_db');
  // @ts-expect-error - LangGraph 타입 추론 이슈, 런타임에는 정상 동작
  workflow.addEdge('solve_with_full_db', 'solve_with_learner_db');
  // @ts-expect-error - LangGraph 타입 추론 이슈, 런타임에는 정상 동작
  workflow.addEdge('solve_with_learner_db', 'evaluate');
  // @ts-expect-error - LangGraph 타입 추론 이슈, 런타임에는 정상 동작
  workflow.addEdge('evaluate', END);

  return workflow.compile();
}

/**
 * 워크플로우 실행
 */
export async function runWorkflow() {
  console.log('=== K-Audit 워크플로우 시작 ===');

  // 벡터 인덱스 확인 및 생성
  console.log('벡터 인덱스 확인 중...');
  const indexExists = await vectorIndexExists();

  if (!indexExists) {
    console.log('벡터 인덱스가 없습니다. 생성 중...');
    await createVectorIndex();
    console.log('벡터 인덱스 생성 완료');
  } else {
    console.log('벡터 인덱스 확인 완료');
  }

  const app = createWorkflow();

  const initialState: WorkflowState = {
    concepts: [],
    questions: [],
    baseAnswers: [],
    learnerAnswers: [],
    baseScore: 0,
    learnerScore: 0,
    scoreGap: 0,
    results: null,
  };

  const result = await app.invoke(initialState);

  console.log('=== 워크플로우 완료 ===');

  return result;
}
