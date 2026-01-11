import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('concepts_with_centrality')
      .select('name, description, is_learned, degree')
      .order('degree', { ascending: false });

    if (error) {
      throw error;
    }

    const concepts = (data || []).map((row) => ({
      name: row.name,
      description: row.description,
      is_learned: row.is_learned || false,
      degree: row.degree,
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
  }
}
