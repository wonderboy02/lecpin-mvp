import { getSession } from './neo4j';

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
  const session = getSession();
  try {
    await session.run(
      `
      MERGE (c:Concept {name: $name})
      SET c.description = $description,
          c.is_learned = COALESCE($is_learned, false),
          c.updated_at = datetime()
      `,
      {
        name: concept.name,
        description: concept.description,
        is_learned: concept.is_learned ?? false,
      }
    );

    // 벡터 임베딩이 있는 경우 별도로 저장
    if (concept.embedding) {
      await session.run(
        `
        MATCH (c:Concept {name: $name})
        SET c.embedding = $embedding
        `,
        {
          name: concept.name,
          embedding: concept.embedding,
        }
      );
    }
  } finally {
    await session.close();
  }
}

/**
 * Concept 간의 관계를 생성합니다
 */
export async function createRelation(
  relation: ConceptRelation
): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (a:Concept {name: $from})
      MATCH (b:Concept {name: $to})
      MERGE (a)-[r:RELATED_TO {type: $type}]->(b)
      SET r.updated_at = datetime()
      `,
      {
        from: relation.from,
        to: relation.to,
        type: relation.type,
      }
    );
  } finally {
    await session.close();
  }
}

/**
 * 학습 완료 상태를 업데이트합니다
 */
export async function markAsLearned(conceptName: string): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (c:Concept {name: $name})
      SET c.is_learned = true,
          c.learned_at = datetime()
      `,
      { name: conceptName }
    );
  } finally {
    await session.close();
  }
}

/**
 * 중심성(Centrality)이 높은 개념들을 가져옵니다
 */
export async function getHighCentralityConcepts(
  limit: number = 10
): Promise<ConceptNode[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (c:Concept)
      RETURN c.name as name,
             c.description as description,
             c.is_learned as is_learned,
             size((c)-[:RELATED_TO]-()) as degree
      ORDER BY degree DESC
      LIMIT $limit
      `,
      { limit }
    );

    return result.records.map((record) => ({
      name: record.get('name'),
      description: record.get('description'),
      is_learned: record.get('is_learned'),
    }));
  } finally {
    await session.close();
  }
}

/**
 * 학습 완료된 개념들만 가져옵니다
 */
export async function getLearnedConcepts(): Promise<ConceptNode[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (c:Concept {is_learned: true})
      RETURN c.name as name,
             c.description as description
      `
    );

    return result.records.map((record) => ({
      name: record.get('name'),
      description: record.get('description'),
      is_learned: true,
    }));
  } finally {
    await session.close();
  }
}

/**
 * 강의 텍스트를 Neo4j 그래프로 변환하는 전체 파이프라인
 * @param text 강의 텍스트
 * @returns 생성된 개념 및 관계 수
 */
export async function ingestLectureText(text: string): Promise<{
  conceptCount: number;
  relationCount: number;
}> {
  // 동적 import를 사용하여 순환 의존성 방지
  const { extractConcepts } = await import('./concept-extractor');
  const { generateEmbeddings, conceptToEmbeddingText } = await import(
    './embeddings'
  );

  console.log('1. 개념 추출 시작...');
  const { concepts, relations } = await extractConcepts(text);
  console.log(`추출 완료: ${concepts.length}개 개념, ${relations.length}개 관계`);

  if (concepts.length === 0) {
    throw new Error('추출된 개념이 없습니다');
  }

  console.log('2. 임베딩 생성 시작...');
  const embeddingTexts = concepts.map((c) =>
    conceptToEmbeddingText(c.name, c.description)
  );
  const embeddings = await generateEmbeddings(embeddingTexts);
  console.log(`임베딩 생성 완료: ${embeddings.length}개`);

  console.log('3. Neo4j에 개념 저장 시작...');
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
