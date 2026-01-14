import { createClient } from '@/lib/supabase/server'
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

    // 사용자의 GitHub 토큰 가져오기
    const { data: profile } = await supabase
      .from('users')
      .select('github_token, github_username')
      .eq('id', user.id)
      .single()

    if (!profile?.github_token) {
      return NextResponse.json(
        { error: 'GitHub 토큰이 없습니다. 다시 로그인해주세요.' },
        { status: 401 }
      )
    }

    // 요청 파싱
    const body = await request.json()
    const { task_id, repo_name } = body

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id가 필요합니다.' },
        { status: 400 }
      )
    }

    // 과제 정보 가져오기
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, lectures!inner(*)')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 레포가 생성되어 있는지 확인
    if (task.github_repo_url) {
      return NextResponse.json({
        success: true,
        repo_url: task.github_repo_url,
        message: '이미 생성된 레포지토리가 있습니다.',
      })
    }

    // 템플릿 레포 설정 확인
    const templateOwner = process.env.GITHUB_TEMPLATE_OWNER
    const templateRepo = process.env.GITHUB_TEMPLATE_REPO

    if (!templateOwner || !templateRepo) {
      return NextResponse.json(
        { error: 'GitHub 템플릿 설정이 없습니다.' },
        { status: 500 }
      )
    }

    // 레포 이름 생성
    const finalRepoName = repo_name || `lecpin-${task.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Date.now()}`

    // GitHub API로 템플릿에서 레포 생성
    const response = await fetch(
      `https://api.github.com/repos/${templateOwner}/${templateRepo}/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.github_token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          owner: profile.github_username,
          name: finalRepoName,
          description: `Lecpin 실습 과제: ${task.title}`,
          private: false,
          include_all_branches: false,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('GitHub API error:', errorData)

      if (response.status === 422) {
        return NextResponse.json(
          { error: '같은 이름의 레포지토리가 이미 존재합니다.' },
          { status: 422 }
        )
      }

      return NextResponse.json(
        { error: 'GitHub 레포 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    const repoData = await response.json()
    const repoUrl = repoData.html_url

    // 과제에 레포 URL 저장
    await supabase
      .from('tasks')
      .update({ github_repo_url: repoUrl })
      .eq('id', task_id)

    // README 업데이트 (비동기로 실행 - 실패해도 레포 생성은 성공)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    fetch(`${baseUrl}/api/tasks/${task_id}/readme`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    }).catch(err => {
      console.error('README update failed (non-blocking):', err)
    })

    return NextResponse.json({
      success: true,
      repo_url: repoUrl,
      repo_name: repoData.name,
    })

  } catch (error) {
    console.error('Create repo error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
