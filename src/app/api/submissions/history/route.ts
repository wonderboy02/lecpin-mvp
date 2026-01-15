import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 특정 과제에 대한 제출 이력 조회
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // URL에서 task_id 추출
    const { searchParams } = new URL(request.url)
    const task_id = searchParams.get('task_id')

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id가 필요합니다.' },
        { status: 400 }
      )
    }

    // 해당 과제의 모든 제출 이력 조회 (피드백 포함)
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        feedback:feedbacks(*)
      `)
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .order('attempt_number', { ascending: false })

    if (error) {
      console.error('Submissions history error:', error)
      return NextResponse.json(
        { error: '제출 이력 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
      totalAttempts: submissions?.length || 0,
    })

  } catch (error) {
    console.error('Submissions history error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
