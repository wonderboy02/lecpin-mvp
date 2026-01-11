import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

/**
 * Supabase 클라이언트 인스턴스를 가져옵니다 (싱글톤)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('Supabase 연결 설정:', {
      url: supabaseUrl || 'undefined',
      hasKey: !!supabaseKey,
      nodeEnv: process.env.NODE_ENV,
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.\n' +
          'SUPABASE_URL과 SUPABASE_ANON_KEY를 설정해야 합니다.'
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
}

/**
 * Supabase 연결 상태를 확인합니다
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('concepts').select('id').limit(1);

    if (error) {
      console.error('Supabase 연결 확인 실패:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase 연결 실패:', error);
    return false;
  }
}
