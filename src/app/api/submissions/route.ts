import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GitHub URL로 제출
export async function POST(request: Request) {
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

    // 요청 파싱
    const body = await request.json()
    const { task_id, github_repo_url, description } = body

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!github_repo_url) {
      return NextResponse.json(
        { error: 'GitHub 레포지토리 URL이 필요합니다.' },
        { status: 400 }
      )
    }

    // 과제 확인
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 제출이 있는지 확인
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .single()

    if (existingSubmission) {
      // 기존 제출 업데이트
      const { data: submission, error: updateError } = await supabase
        .from('submissions')
        .update({
          github_repo_url,
          description,
          submission_type: 'github',
          status: 'pending',
        })
        .eq('id', existingSubmission.id)
        .select()
        .single()

      if (updateError) {
        console.error('Submission update error:', updateError)
        return NextResponse.json(
          { error: '제출 업데이트에 실패했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        submission,
        message: '제출이 업데이트되었습니다.',
      })
    }

    // 새 제출 생성
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        task_id,
        user_id: user.id,
        github_repo_url,
        description,
        submission_type: 'github',
        status: 'pending',
        file_path: '', // required field, but not used for github submissions
      })
      .select()
      .single()

    if (insertError) {
      console.error('Submission insert error:', insertError)
      return NextResponse.json(
        { error: '제출 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submission,
    })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
