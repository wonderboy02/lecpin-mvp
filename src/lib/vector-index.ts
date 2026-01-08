import { getSession } from './neo4j';
import { ConceptNode } from './graph-ingestion';

/**
 * Neo4j에 벡터 인덱스를 생성합니다 (3072차원)
 * 초기 설정 시 1회만 실행하면 됩니다
 */
export async function createVectorIndex(): Promise<void> {
  const session = getSession();
  try {
    await session.run(`
      CREATE VECTOR INDEX concept_embedding IF NOT EXISTS
      FOR (c:Concept)
      ON c.embedding
      OPTIONS {indexConfig: {
        \`vector.dimensions\`: 3072,
        \`vector.similarity_function\`: 'cosine'
      }}
    `);

    console.log('벡터 인덱스 생성 완료');
  } catch (error) {
    console.error('벡터 인덱스 생성 실패:', error);
    throw new Error('벡터 인덱스 생성 중 오류가 발생했습니다');
  } finally {
    await session.close();
  }
}

/**
 * 벡터 유사도 기반으로 관련 개념을 검색합니다
 * @param queryEmbedding 쿼리 임베딩 벡터 (3072차원)
 * @param limit 반환할 최대 개념 수
 * @param learnedOnly true이면 학습한 개념만 반환
 * @returns 유사도 점수와 함께 개념 배열
 */
export async function searchSimilarConcepts(
  queryEmbedding: number[],
  limit: number = 5,
  learnedOnly: boolean = false
): Promise<(ConceptNode & { score: number })[]> {
  const session = getSession();
  try {
    // 벡터 검색 쿼리
    const query = `
      CALL db.index.vector.queryNodes('concept_embedding', $limit, $embedding)
      YIELD node, score
      WHERE ($learnedOnly = false OR node.is_learned = true)
      RETURN node.name as name,
             node.description as description,
             node.is_learned as is_learned,
             score
      ORDER BY score DESC
    `;

    const result = await session.run(query, {
      limit,
      embedding: queryEmbedding,
      learnedOnly,
    });

    return result.records.map((record) => ({
      name: record.get('name'),
      description: record.get('description'),
      is_learned: record.get('is_learned') || false,
      score: record.get('score'),
    }));
  } catch (error) {
    console.error('벡터 검색 실패:', error);
    throw new Error('벡터 검색 중 오류가 발생했습니다');
  } finally {
    await session.close();
  }
}

/**
 * 벡터 인덱스가 존재하는지 확인합니다
 */
export async function vectorIndexExists(): Promise<boolean> {
  const session = getSession();
  try {
    const result = await session.run(`
      SHOW INDEXES
      YIELD name, type
      WHERE name = 'concept_embedding' AND type = 'VECTOR'
      RETURN count(*) as count
    `);

    const count = result.records[0]?.get('count');
    return count > 0;
  } catch (error) {
    console.error('벡터 인덱스 확인 실패:', error);
    return false;
  } finally {
    await session.close();
  }
}
