import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ZIP 파일 업로드로 제출
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

    // FormData 파싱
    const formData = await request.formData()
    const file = formData.get('file') as File
    const task_id = formData.get('task_id') as string
    const description = formData.get('description') as string

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 확인
    if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'ZIP 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 확인 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 50MB 이하여야 합니다.' },
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

    // 파일 경로 생성
    const timestamp = Date.now()
    const filePath = `${user.id}/${task_id}/${timestamp}-${file.name}`

    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 이미 제출이 있는지 확인
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id, file_path')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .single()

    if (existingSubmission) {
      // 기존 파일 삭제
      if (existingSubmission.file_path) {
        await supabase.storage
          .from('submissions')
          .remove([existingSubmission.file_path])
      }

      // 기존 제출 업데이트
      const { data: submission, error: updateError } = await supabase
        .from('submissions')
        .update({
          file_path: filePath,
          description,
          submission_type: 'upload',
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
        file_path: filePath,
        description,
        submission_type: 'upload',
        status: 'pending',
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
    console.error('Upload submission error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
