import { getSupabaseClient } from './supabase';
import { ConceptNode } from './graph-ingestion';

/**
 * pgvector 인덱스를 생성합니다 (1536차원)
 * 실제로는 Supabase 마이그레이션 스크립트에서 이미 생성되지만,
 * 호환성을 위해 함수는 유지합니다.
 */
export async function createVectorIndex(): Promise<void> {
  console.log('pgvector 인덱스는 Supabase 스키마 생성 시 이미 설정됨');
  // 실제로는 아무 작업도 하지 않음 (스키마에서 이미 생성됨)
}

/**
 * 벡터 유사도 기반으로 관련 개념을 검색합니다
 * @param queryEmbedding 쿼리 임베딩 벡터 (1536차원)
 * @param limit 반환할 최대 개념 수
 * @param learnedOnly true이면 학습한 개념만 반환
 * @returns 유사도 점수와 함께 개념 배열
 */
export async function searchSimilarConcepts(
  queryEmbedding: number[],
  limit: number = 5,
  learnedOnly: boolean = false
): Promise<(ConceptNode & { score: number })[]> {
  const supabase = getSupabaseClient();

  try {
    // pgvector cosine similarity 검색 (PostgreSQL RPC 함수 호출)
    const { data, error } = await supabase.rpc('search_concepts', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: limit,
      learned_only: learnedOnly,
    });

    if (error) {
      console.error('벡터 검색 실패:', error);
      throw new Error(`벡터 검색 중 오류가 발생했습니다: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      name: row.name,
      description: row.description,
      is_learned: row.is_learned || false,
      score: row.similarity,
    }));
  } catch (error) {
    console.error('벡터 검색 실패:', error);
    throw error;
  }
}

/**
 * 벡터 인덱스가 존재하는지 확인합니다
 */
export async function vectorIndexExists(): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.rpc('check_vector_index_exists');

    if (error) {
      console.error('벡터 인덱스 확인 실패:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('벡터 인덱스 확인 실패:', error);
    return false;
  }
}
