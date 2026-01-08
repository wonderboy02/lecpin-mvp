import OpenAI from 'openai';
import { ConceptNode, ConceptRelation } from './graph-ingestion';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractionResult {
  concepts: Omit<ConceptNode, 'embedding' | 'is_learned'>[];
  relations: ConceptRelation[];
}

/**
 * 강의 텍스트에서 핵심 개념과 관계를 추출합니다
 * @param text 강의 텍스트
 * @returns 추출된 개념과 관계
 */
export async function extractConcepts(
  text: string
): Promise<ExtractionResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `당신은 강의 텍스트에서 핵심 개념(Concept)과 개념 간 관계를 추출하는 전문가입니다.

추출 기준:
1. **개념 (Concept)**:
   - 강의에서 설명하는 핵심 용어, 기술, 개념, 프로세스 등
   - 이름은 간결하게 (2-4 단어)
   - 설명은 명확하고 구체적으로 (1-2 문장)

2. **관계 (Relation)**:
   - prerequisite: A를 이해하려면 B를 먼저 알아야 함
   - component: A는 B의 구성 요소임
   - related: A와 B는 관련이 있음
   - uses: A는 B를 사용함
   - manages: A는 B를 관리함

JSON 형식으로 응답하세요.`,
        },
        {
          role: 'user',
          content: `다음 강의 텍스트에서 핵심 개념과 관계를 추출하세요:

${text}

JSON 형식:
{
  "concepts": [
    {"name": "개념명", "description": "설명"}
  ],
  "relations": [
    {"from": "개념A", "to": "개념B", "type": "prerequisite|component|related|uses|manages"}
  ]
}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('LLM 응답이 비어있습니다');
    }

    const result = JSON.parse(content);

    // 데이터 검증
    if (!result.concepts || !Array.isArray(result.concepts)) {
      throw new Error('개념 배열이 올바르지 않습니다');
    }

    if (!result.relations || !Array.isArray(result.relations)) {
      throw new Error('관계 배열이 올바르지 않습니다');
    }

    // 중복 제거
    const uniqueConcepts = removeDuplicateConcepts(result.concepts);
    const uniqueRelations = removeDuplicateRelations(result.relations);

    console.log(
      `추출 완료: ${uniqueConcepts.length}개 개념, ${uniqueRelations.length}개 관계`
    );

    return {
      concepts: uniqueConcepts,
      relations: uniqueRelations,
    };
  } catch (error) {
    console.error('개념 추출 실패:', error);
    throw new Error('개념 추출 중 오류가 발생했습니다');
  }
}

/**
 * 중복 개념 제거 (이름 기준)
 */
function removeDuplicateConcepts(
  concepts: Omit<ConceptNode, 'embedding' | 'is_learned'>[]
): Omit<ConceptNode, 'embedding' | 'is_learned'>[] {
  const seen = new Set<string>();
  const unique: Omit<ConceptNode, 'embedding' | 'is_learned'>[] = [];

  for (const concept of concepts) {
    const normalizedName = concept.name.trim().toLowerCase();
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      unique.push({
        name: concept.name.trim(),
        description: concept.description.trim(),
      });
    }
  }

  return unique;
}

/**
 * 중복 관계 제거 (from-to-type 조합 기준)
 */
function removeDuplicateRelations(
  relations: ConceptRelation[]
): ConceptRelation[] {
  const seen = new Set<string>();
  const unique: ConceptRelation[] = [];

  for (const relation of relations) {
    const key = `${relation.from}|${relation.to}|${relation.type}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        from: relation.from.trim(),
        to: relation.to.trim(),
        type: relation.type,
      });
    }
  }

  return unique;
}
