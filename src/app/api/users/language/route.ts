import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { language } = body

    if (!language || !['ko', 'en'].includes(language)) {
      return NextResponse.json({ error: '유효하지 않은 언어입니다.' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update language error:', updateError)
      return NextResponse.json({ error: '언어 설정 변경에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, language })

  } catch (error) {
    console.error('Language update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
