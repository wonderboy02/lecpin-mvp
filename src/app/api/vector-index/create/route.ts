import { NextResponse } from 'next/server';
import { createVectorIndex, vectorIndexExists } from '@/lib/vector-index';

export async function POST() {
  try {
    // 이미 존재하는지 확인
    const exists = await vectorIndexExists();

    if (exists) {
      return NextResponse.json({
        success: true,
        message: '벡터 인덱스가 이미 존재합니다',
        alreadyExists: true,
      });
    }

    // 벡터 인덱스 생성
    await createVectorIndex();

    return NextResponse.json({
      success: true,
      message: '벡터 인덱스가 생성되었습니다 (3072차원, cosine similarity)',
      alreadyExists: false,
    });
  } catch (error: any) {
    console.error('벡터 인덱스 생성 오류:', error);
    return NextResponse.json(
      {
        error: '벡터 인덱스 생성 중 오류가 발생했습니다',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
