import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabase
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '과제를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ userTask: data })

  } catch (error) {
    console.error('Get user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { current_step, status, task_id, submission_id, feedback_id } = body

    // 본인 과제인지 확인
    const { data: existing, error: findError } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: '과제를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 업데이트할 필드만 포함
    const updateData: Record<string, unknown> = {}
    if (current_step) updateData.current_step = current_step
    if (status) updateData.status = status
    if (task_id) updateData.task_id = task_id
    if (submission_id) updateData.submission_id = submission_id
    if (feedback_id) updateData.feedback_id = feedback_id

    const { data: updated, error: updateError } = await supabase
      .from('user_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update user task error:', updateError)
      return NextResponse.json({ error: '업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ userTask: updated })

  } catch (error) {
    console.error('Update user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 삭제 대신 상태를 'abandoned'로 변경 (soft delete)
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({ status: 'abandoned' })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Abandon user task error:', updateError)
      return NextResponse.json({ error: '과제 포기에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Abandon user task error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
