import { createClient } from '@/lib/supabase/server'
import { openai, TASK_GENERATION_PROMPT } from '@/lib/openai'
import { NextResponse } from 'next/server'

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
    const { lecture_id } = body

    if (!lecture_id) {
      return NextResponse.json(
        { error: 'lecture_id가 필요합니다.' },
        { status: 400 }
      )
    }

    // 강의 정보 및 역량 가져오기
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select(`
        *,
        competencies (*)
      `)
      .eq('id', lecture_id)
      .single()

    if (lectureError || !lecture) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 생성된 과제가 있는지 확인
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('lecture_id', lecture_id)
      .single()

    if (existingTask) {
      return NextResponse.json({
        success: true,
        task: existingTask,
        message: '이미 생성된 과제가 있습니다.',
      })
    }

    // OpenAI로 과제 생성
    const competenciesText = lecture.competencies
      .map((c: { name: string; description: string }, i: number) => `${i + 1}. ${c.name}: ${c.description}`)
      .join('\n')

    const prompt = `강의 제목: ${lecture.title}
프로그래밍 언어: ${lecture.language || '미지정'}

핵심 역량:
${competenciesText}

강의 자막 요약 (처음 5000자):
${lecture.transcript?.slice(0, 5000) || '자막 없음'}

위 정보를 바탕으로 학습자가 핵심 역량을 실습할 수 있는 과제를 생성해주세요.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: TASK_GENERATION_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const taskResult = JSON.parse(completion.choices[0].message.content || '{}')

    // 과제 저장
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        lecture_id,
        title: taskResult.title || '실습 과제',
        description: taskResult.description || '',
        reason: taskResult.reason || '',
        difficulty: taskResult.difficulty || 'intermediate',
        estimated_time: taskResult.estimated_time || '2-3시간',
        tech_stack: taskResult.tech_stack || [],
        steps: taskResult.steps || [],
        success_criteria: taskResult.success_criteria || [],
      })
      .select()
      .single()

    if (taskError) {
      console.error('Task insert error:', taskError)
      return NextResponse.json(
        { error: '과제 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      task,
    })

  } catch (error) {
    console.error('Task generate error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
