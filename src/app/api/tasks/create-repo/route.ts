import { createClient } from '@/lib/supabase/server'
import { translateToProjectName } from '@/lib/openai'
import { updateRepoReadme } from '@/lib/github'
import { NextResponse } from 'next/server'
import { Task } from '@/types'

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

    // 레포 이름 생성: lecpin-{username}-{projectname}
    let baseRepoName = repo_name
    if (!baseRepoName) {
      const projectName = await translateToProjectName(task.title)
      baseRepoName = `lecpin-${profile.github_username}-${projectName}`
    }

    // GitHub API로 템플릿에서 레포 생성 (중복 시 자동 넘버링)
    let repoData = null
    let finalRepoName = baseRepoName
    const MAX_ATTEMPTS = 5

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // 2번째 시도부터 숫자 추가
      if (attempt > 1) {
        finalRepoName = `${baseRepoName}-${attempt}`
      }

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

      if (response.ok) {
        repoData = await response.json()
        break // 성공하면 루프 종료
      }

      const errorData = await response.json()
      console.error(`GitHub API error (attempt ${attempt}):`, errorData)

      // 422 에러(중복)가 아닌 경우 즉시 반환
      if (response.status !== 422) {
        return NextResponse.json(
          { error: 'GitHub 레포 생성에 실패했습니다.' },
          { status: 500 }
        )
      }

      // 422 에러(중복)이고 마지막 시도인 경우
      if (attempt === MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: '레포지토리 이름 중복으로 생성에 실패했습니다. 다른 이름을 시도해주세요.' },
          { status: 422 }
        )
      }

      // 422 에러이고 아직 시도 횟수가 남았으면 다음 루프로 계속
    }

    if (!repoData) {
      return NextResponse.json(
        { error: '레포지토리 생성에 실패했습니다.' },
        { status: 500 }
      )
    }
    const repoUrl = repoData.html_url

    // 과제에 레포 URL 저장
    await supabase
      .from('tasks')
      .update({ github_repo_url: repoUrl })
      .eq('id', task_id)

    // README 업데이트 (직접 실행)
    const readmeResult = await updateRepoReadme({
      repoUrl,
      githubToken: profile.github_token,
      task: task as unknown as Task,
    })

    if (!readmeResult.success) {
      console.error('README update failed:', readmeResult.error)
      // README 실패해도 레포 생성은 성공으로 처리
    }

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
