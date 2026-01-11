import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const { name } = await params;
    const conceptName = decodeURIComponent(name);
    const { learned } = await request.json();

    const updateData = learned
      ? {
          is_learned: true,
          learned_at: new Date().toISOString(),
        }
      : {
          is_learned: false,
          learned_at: null,
        };

    const { error } = await supabase
      .from('concepts')
      .update(updateData)
      .eq('name', conceptName);

    if (error) {
      throw error;
    }

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
