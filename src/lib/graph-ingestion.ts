import { getSupabaseClient } from './supabase';

/**
 * GraphRAG를 위한 지식 그래프 생성
 */
export interface ConceptNode {
  name: string;
  description: string;
  embedding?: number[];
  is_learned?: boolean;
}

export interface ConceptRelation {
  from: string;
  to: string;
  type: string;
}

/**
 * Concept 노드를 생성하거나 업데이트합니다
 */
export async function upsertConcept(concept: ConceptNode): Promise<void> {
  const supabase = getSupabaseClient();

  // PostgreSQL UPSERT (ON CONFLICT)
  const { error } = await supabase
    .from('concepts')
    .upsert(
      {
        name: concept.name,
        description: concept.description,
        is_learned: concept.is_learned ?? false,
        embedding: concept.embedding ? JSON.stringify(concept.embedding) : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'name', // UNIQUE 제약조건 컬럼
        ignoreDuplicates: false, // UPDATE 수행
      }
    );

  if (error) {
    throw new Error(`개념 저장 실패 (${concept.name}): ${error.message}`);
  }
}

/**
 * Concept 간의 관계를 생성합니다
 */
export async function createRelation(relation: ConceptRelation): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. from/to 개념의 ID 조회
  const { data: fromConcept, error: fromError } = await supabase
    .from('concepts')
    .select('id')
    .eq('name', relation.from)
    .single();

  const { data: toConcept, error: toError } = await supabase
    .from('concepts')
    .select('id')
    .eq('name', relation.to)
    .single();

  if (fromError || toError || !fromConcept || !toConcept) {
    throw new Error(
      `관계 생성 실패: 개념을 찾을 수 없습니다 (${relation.from} -> ${relation.to})`
    );
  }

  // 2. 관계 생성 (UPSERT)
  const { error } = await supabase.from('relations').upsert(
    {
      from_concept_id: fromConcept.id,
      to_concept_id: toConcept.id,
      relation_type: relation.type,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'from_concept_id,to_concept_id,relation_type',
      ignoreDuplicates: false,
    }
  );

  if (error) {
    throw new Error(
      `관계 저장 실패 (${relation.from} -> ${relation.to}): ${error.message}`
    );
  }
}

/**
 * 학습 완료 상태를 업데이트합니다
 */
export async function markAsLearned(conceptName: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('concepts')
    .update({
      is_learned: true,
      learned_at: new Date().toISOString(),
    })
    .eq('name', conceptName);

  if (error) {
    throw new Error(`학습 상태 업데이트 실패 (${conceptName}): ${error.message}`);
  }
}

/**
 * 중심성(Centrality)이 높은 개념들을 가져옵니다
 */
export async function getHighCentralityConcepts(
  limit: number = 10
): Promise<ConceptNode[]> {
  const supabase = getSupabaseClient();

  // concepts_with_centrality 뷰 사용
  const { data, error } = await supabase
    .from('concepts_with_centrality')
    .select('name, description, is_learned, degree')
    .order('degree', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`중심성 개념 조회 실패: ${error.message}`);
  }

  return (data || []).map((row) => ({
    name: row.name,
    description: row.description,
    is_learned: row.is_learned,
  }));
}

/**
 * 학습 완료된 개념들만 가져옵니다
 */
export async function getLearnedConcepts(): Promise<ConceptNode[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('concepts')
    .select('name, description')
    .eq('is_learned', true);

  if (error) {
    throw new Error(`학습 개념 조회 실패: ${error.message}`);
  }

  return (data || []).map((row) => ({
    name: row.name,
    description: row.description,
    is_learned: true,
  }));
}

/**
 * 강의 텍스트를 Supabase 그래프로 변환하는 전체 파이프라인
 * @param text 강의 텍스트
 * @returns 생성된 개념 및 관계 수
 */
export async function ingestLectureText(text: string): Promise<{
  conceptCount: number;
  relationCount: number;
}> {
  // 동적 import를 사용하여 순환 의존성 방지
  const { extractConcepts } = await import('./concept-extractor');
  const { generateEmbeddings, conceptToEmbeddingText } =
    await import('./embeddings');
  const { vectorIndexExists, createVectorIndex } = await import(
    './vector-index'
  );

  // 벡터 인덱스 확인 및 생성
  console.log('0. 벡터 인덱스 확인 중...');
  const indexExists = await vectorIndexExists();
  if (!indexExists) {
    console.log('벡터 인덱스가 없습니다. 생성 중...');
    await createVectorIndex();
    console.log('벡터 인덱스 생성 완료');
  }

  console.log('1. 개념 추출 시작...');
  const { concepts, relations } = await extractConcepts(text);
  console.log(
    `추출 완료: ${concepts.length}개 개념, ${relations.length}개 관계`
  );

  if (concepts.length === 0) {
    throw new Error('추출된 개념이 없습니다');
  }

  console.log('2. 임베딩 생성 시작...');
  const embeddingTexts = concepts.map((c) =>
    conceptToEmbeddingText(c.name, c.description)
  );
  const embeddings = await generateEmbeddings(embeddingTexts);
  console.log(`임베딩 생성 완료: ${embeddings.length}개`);

  console.log('3. Supabase에 개념 저장 시작...');
  for (let i = 0; i < concepts.length; i++) {
    await upsertConcept({
      ...concepts[i],
      embedding: embeddings[i],
      is_learned: false,
    });
  }
  console.log('개념 저장 완료');

  console.log('4. 관계 생성 시작...');
  for (const relation of relations) {
    try {
      await createRelation(relation);
    } catch (error) {
      // 존재하지 않는 노드 간 관계는 스킵
      console.warn(
        `관계 생성 스킵: ${relation.from} -> ${relation.to} (${relation.type})`
      );
    }
  }
  console.log('관계 생성 완료');

  return {
    conceptCount: concepts.length,
    relationCount: relations.length,
  };
}
