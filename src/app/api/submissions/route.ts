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
    const { task_id, github_repo_url: providedUrl, description } = body

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id가 필요합니다.' },
        { status: 400 }
      )
    }

    // 과제 확인 (github_repo_url도 함께 조회)
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, github_repo_url')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // GitHub URL 결정: 제공된 URL이 있으면 사용, 없으면 task의 URL 사용
    const github_repo_url = providedUrl || task.github_repo_url

    if (!github_repo_url) {
      return NextResponse.json(
        { error: '연결된 GitHub 저장소가 없습니다. 먼저 저장소를 생성해주세요.' },
        { status: 400 }
      )
    }

    // 기존 제출 횟수 조회 (attempt_number 계산용)
    const { data: existingSubmissions } = await supabase
      .from('submissions')
      .select('attempt_number')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .order('attempt_number', { ascending: false })
      .limit(1)

    const nextAttemptNumber = existingSubmissions && existingSubmissions.length > 0
      ? existingSubmissions[0].attempt_number + 1
      : 1

    // 새 제출 생성 (항상 새로운 submission 생성)
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
        attempt_number: nextAttemptNumber,
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
