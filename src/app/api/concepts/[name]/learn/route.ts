import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/neo4j';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const conceptName = decodeURIComponent(params.name);
    const { learned } = await request.json();

    const session = getSession();

    if (learned) {
      // 학습 완료 표시
      await session.run(
        `
        MATCH (c:Concept {name: $name})
        SET c.is_learned = true,
            c.learned_at = datetime()
        `,
        { name: conceptName }
      );
    } else {
      // 학습 완료 취소
      await session.run(
        `
        MATCH (c:Concept {name: $name})
        SET c.is_learned = false
        `,
        { name: conceptName }
      );
    }

    await session.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('학습 상태 업데이트 오류:', error);
    return NextResponse.json(
      {
        error: '학습 상태 업데이트 중 오류가 발생했습니다',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
