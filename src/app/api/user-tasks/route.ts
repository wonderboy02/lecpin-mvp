import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'in_progress' | 'completed' | 'all'

    let query = supabase
      .from('user_tasks')
      .select(`
        *,
        lecture:lectures(*,
          competencies(*)
        ),
        task:tasks(*),
        submission:submissions(*),
        feedback:feedbacks(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Fetch user tasks error:', error)
      return NextResponse.json({ error: '과제 목록을 불러오는데 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ tasks: data })

  } catch (error) {
    console.error('User tasks error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { lecture_id } = body

    if (!lecture_id) {
      return NextResponse.json({ error: 'lecture_id가 필요합니다.' }, { status: 400 })
    }

    // 강의 존재 확인
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select('id')
      .eq('id', lecture_id)
      .single()

    if (lectureError || !lecture) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 새 user_task 생성
    const { data: userTask, error: insertError } = await supabase
      .from('user_tasks')
      .insert({
        user_id: user.id,
        lecture_id,
        current_step: 'summary', // 강의 분석 완료 후 생성되므로
      })
      .select()
      .single()

    if (insertError) {
      console.error('Create user task error:', insertError)
      return NextResponse.json({ error: '과제 생성에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ userTask })

  } catch (error) {
    console.error('Create user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
