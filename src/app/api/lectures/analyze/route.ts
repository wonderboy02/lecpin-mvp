import { createClient } from '@/lib/supabase/server'
import { openai, COMPETENCY_ANALYSIS_PROMPT, getLanguageInstruction } from '@/lib/openai'
import { extractVideoId, getThumbnailUrl, fetchTranscript } from '@/lib/youtube'
import { NextResponse } from 'next/server'
import type { Language } from '@/types'

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
    const { youtube_url, language = 'ko' } = body as { youtube_url: string; language?: Language }

    if (!youtube_url) {
      return NextResponse.json(
        { error: 'YouTube URL이 필요합니다.' },
        { status: 400 }
      )
    }

    // Video ID 추출
    const videoId = extractVideoId(youtube_url)
    if (!videoId) {
      return NextResponse.json(
        { error: '유효한 YouTube URL이 아닙니다.' },
        { status: 400 }
      )
    }

    // 강의 생성 (pending 상태)
    const { data: lecture, error: insertError } = await supabase
      .from('lectures')
      .insert({
        user_id: user.id,
        title: '분석 중...',
        youtube_url,
        youtube_id: videoId,
        thumbnail_url: getThumbnailUrl(videoId),
        status: 'extracting',
        source_type: 'youtube',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Lecture insert error:', insertError)
      return NextResponse.json(
        { error: '강의 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    try {
      // 자막 추출
      const transcript = await fetchTranscript(videoId)
      console.log(`[analyze] Transcript length: ${transcript.length} chars`)
      console.log(`[analyze] Transcript preview: ${transcript.slice(0, 500)}...`)

      // 상태 업데이트: analyzing
      await supabase
        .from('lectures')
        .update({ status: 'analyzing', transcript })
        .eq('id', lecture.id)

      // OpenAI로 역량 분석 (언어 설정 반영)
      const languageInstruction = getLanguageInstruction(language)
      console.log(`[analyze] Sending to OpenAI (${transcript.slice(0, 15000).length} chars)... Language: ${language}`)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `${COMPETENCY_ANALYSIS_PROMPT}\n\n${languageInstruction}` },
          { role: 'user', content: `다음 강의 자막을 분석해주세요:\n\n${transcript.slice(0, 15000)}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })

      const rawResponse = completion.choices[0].message.content || '{}'
      console.log(`[analyze] OpenAI raw response: ${rawResponse}`)
      const analysisResult = JSON.parse(rawResponse)
      console.log(`[analyze] Parsed result:`, JSON.stringify(analysisResult, null, 2))

      // 강의 정보 업데이트
      await supabase
        .from('lectures')
        .update({
          title: analysisResult.title || '제목 없음',
          language: analysisResult.language,
          status: 'completed',
        })
        .eq('id', lecture.id)

      // 역량 저장
      console.log(`[analyze] Competencies from result:`, analysisResult.competencies)
      if (analysisResult.competencies && Array.isArray(analysisResult.competencies)) {
        const competenciesToInsert = analysisResult.competencies.map(
          (comp: { name: string; description: string }, index: number) => ({
            lecture_id: lecture.id,
            name: comp.name,
            description: comp.description,
            order_index: index,
          })
        )

        console.log(`[analyze] Inserting ${competenciesToInsert.length} competencies:`, competenciesToInsert)
        const { error: compError } = await supabase.from('competencies').insert(competenciesToInsert)
        if (compError) {
          console.error(`[analyze] Failed to insert competencies:`, compError)
        } else {
          console.log(`[analyze] Successfully inserted ${competenciesToInsert.length} competencies`)
        }
      } else {
        console.warn(`[analyze] No competencies found in result`)
      }

      // 완성된 데이터 가져오기
      const { data: completedLecture } = await supabase
        .from('lectures')
        .select(`
          *,
          competencies (*)
        `)
        .eq('id', lecture.id)
        .single()

      return NextResponse.json({
        success: true,
        lecture: completedLecture,
      })

    } catch (processingError) {
      // 처리 중 에러 발생 시 상태 업데이트
      const errorMessage = processingError instanceof Error
        ? processingError.message
        : '알 수 없는 오류'

      await supabase
        .from('lectures')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', lecture.id)

      return NextResponse.json(
        { error: errorMessage, lecture_id: lecture.id },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Lecture analyze error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
