import { NextResponse } from 'next/server';
import { getSession } from '@/lib/neo4j';

export async function GET() {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (c:Concept)
      RETURN c.name as name,
             c.description as description,
             c.is_learned as is_learned,
             COUNT { (c)-[:RELATED_TO]-() } as degree
      ORDER BY degree DESC
    `);

    const concepts = result.records.map((record) => ({
      name: record.get('name'),
      description: record.get('description'),
      is_learned: record.get('is_learned') || false,
      degree: record.get('degree').toInt(),
    }));

    return NextResponse.json({ concepts });
  } catch (error: any) {
    console.error('개념 목록 조회 오류:', error);
    return NextResponse.json(
      {
        error: '개념 목록 조회 중 오류가 발생했습니다',
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
