import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 온보딩 완료 상태 조회
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      onboarding_completed: profile?.onboarding_completed || false
    })

  } catch (error) {
    console.error('Onboarding check error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 온보딩 완료 처리
export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update onboarding error:', updateError)
      return NextResponse.json({ error: '업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
