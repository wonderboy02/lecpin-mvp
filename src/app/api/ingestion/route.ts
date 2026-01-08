import { NextRequest, NextResponse } from 'next/server';
import { ingestLectureText } from '@/lib/graph-ingestion';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    console.log(`Ingestion 시작: ${text.length}자`);

    const result = await ingestLectureText(text);

    return NextResponse.json({
      success: true,
      conceptCount: result.conceptCount,
      relationCount: result.relationCount,
      message: `${result.conceptCount}개 개념과 ${result.relationCount}개 관계가 생성되었습니다`,
    });
  } catch (error: any) {
    console.error('Ingestion 오류:', error);
    return NextResponse.json(
      {
        error: '그래프 생성 중 오류가 발생했습니다',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Ingestion은 시간이 오래 걸릴 수 있으므로 타임아웃 연장
export const maxDuration = 300; // 5분
