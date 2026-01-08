import { NextResponse } from 'next/server';
import { runWorkflow } from '@/lib/langgraph-workflow';

export async function POST() {
  try {
    console.log('워크플로우 API 호출');

    const result = await runWorkflow();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('워크플로우 실행 오류:', error);
    return NextResponse.json(
      {
        error: '워크플로우 실행 중 오류가 발생했습니다',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// 워크플로우는 시간이 오래 걸릴 수 있음 (문제 생성 + 2번 솔버 + 채점)
export const maxDuration = 300; // 5분
