import { createClient, createServiceClient } from '@/lib/supabase/server'
import { reviewCodeWithCodex } from '@/lib/openai'
import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import type { Language } from '@/types'

// GitHub 레포에서 코드 가져오기
async function fetchGitHubCode(repoUrl: string, githubToken: string): Promise<string> {
  // URL에서 owner/repo 추출
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) {
    throw new Error('유효한 GitHub URL이 아닙니다.')
  }

  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  // 레포 내용 가져오기 (최상위 디렉토리)
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents`,
    {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!response.ok) {
    throw new Error('GitHub 레포지토리에 접근할 수 없습니다.')
  }

  const contents = await response.json()
  let codeContent = ''

  // 재귀적으로 파일 내용 수집
  async function collectFiles(items: unknown[], path = ''): Promise<void> {
    for (const item of items as { name: string; type: string; download_url?: string; url: string }[]) {
      // 특정 파일/폴더 제외
      if (
        item.name.startsWith('.') ||
        item.name === 'node_modules' ||
        item.name === 'dist' ||
        item.name === 'build' ||
        item.name === 'package-lock.json' ||
        item.name === 'yarn.lock'
      ) {
        continue
      }

      if (item.type === 'file') {
        // 코드 파일만 처리
        const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.css', '.html', '.json', '.md']
        const hasCodeExtension = codeExtensions.some(ext => item.name.endsWith(ext))

        if (hasCodeExtension && item.download_url) {
          try {
            const fileResponse = await fetch(item.download_url, {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
              },
            })
            if (fileResponse.ok) {
              const content = await fileResponse.text()
              // 파일이 너무 크면 스킵
              if (content.length < 10000) {
                codeContent += `\n\n--- ${path}${item.name} ---\n${content}`
              }
            }
          } catch {
            // 파일 읽기 실패 시 무시
          }
        }
      } else if (item.type === 'dir' && codeContent.length < 50000) {
        // 디렉토리면 재귀 호출
        try {
          const dirResponse = await fetch(item.url, {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github+json',
            },
          })
          if (dirResponse.ok) {
            const dirContents = await dirResponse.json()
            await collectFiles(dirContents, `${path}${item.name}/`)
          }
        } catch {
          // 디렉토리 읽기 실패 시 무시
        }
      }
    }
  }

  await collectFiles(contents)

  return codeContent.slice(0, 50000) // 최대 50000자
}

// ZIP 파일에서 코드 추출
async function extractZipCode(zipBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(zipBuffer)
  let codeContent = ''

  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.css', '.html', '.json', '.md']

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    // 디렉토리, 숨김 파일, node_modules 등 제외
    if (
      zipEntry.dir ||
      relativePath.includes('node_modules') ||
      relativePath.includes('.git') ||
      relativePath.includes('dist/') ||
      relativePath.includes('build/') ||
      relativePath.startsWith('.') ||
      relativePath.includes('/.')
    ) {
      continue
    }

    const hasCodeExtension = codeExtensions.some(ext => relativePath.endsWith(ext))
    if (!hasCodeExtension) continue

    try {
      const content = await zipEntry.async('string')
      // 파일이 너무 크면 스킵
      if (content.length < 10000) {
        codeContent += `\n\n--- ${relativePath} ---\n${content}`
      }
    } catch {
      // 파일 읽기 실패 시 무시
    }

    // 총 길이 제한
    if (codeContent.length > 50000) break
  }

  return codeContent.slice(0, 50000)
}

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
    const { submission_id, language = 'ko' } = body as { submission_id: string; language?: Language }

    if (!submission_id) {
      return NextResponse.json(
        { error: 'submission_id가 필요합니다.' },
        { status: 400 }
      )
    }

    // 제출 정보 가져오기
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        tasks (
          *,
          lectures (*)
        )
      `)
      .eq('id', submission_id)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: '제출을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 피드백이 있는지 확인
    const { data: existingFeedback } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('submission_id', submission_id)
      .single()

    if (existingFeedback) {
      return NextResponse.json({
        success: true,
        feedback: existingFeedback,
        message: '이미 생성된 피드백이 있습니다.',
      })
    }

    // 제출 상태 업데이트
    await supabase
      .from('submissions')
      .update({ status: 'reviewing' })
      .eq('id', submission_id)

    // 코드 가져오기
    let codeContent = ''

    if (submission.submission_type === 'github' && submission.github_repo_url) {
      // GitHub에서 코드 가져오기
      const { data: profile } = await supabase
        .from('users')
        .select('github_token')
        .eq('id', user.id)
        .single()

      if (!profile?.github_token) {
        return NextResponse.json(
          { error: 'GitHub 토큰이 없습니다. 다시 로그인해주세요.' },
          { status: 401 }
        )
      }

      codeContent = await fetchGitHubCode(submission.github_repo_url, profile.github_token)
    } else if (submission.submission_type === 'upload' && submission.file_path) {
      // Storage에서 ZIP 가져오기
      const serviceClient = createServiceClient()
      const { data: fileData, error: downloadError } = await serviceClient.storage
        .from('submissions')
        .download(submission.file_path)

      if (downloadError || !fileData) {
        return NextResponse.json(
          { error: '파일을 다운로드할 수 없습니다.' },
          { status: 500 }
        )
      }

      const arrayBuffer = await fileData.arrayBuffer()
      codeContent = await extractZipCode(arrayBuffer)
    }

    if (!codeContent || codeContent.length < 100) {
      return NextResponse.json(
        { error: '분석할 코드를 찾을 수 없습니다.' },
        { status: 400 }
      )
    }

    // Codex로 코드 리뷰 (Responses API 사용)
    const task = submission.tasks
    const taskInfo = `과제 정보:
- 제목: ${task.title}
- 설명: ${task.description}
- 성공 기준: ${task.success_criteria?.join(', ') || '없음'}`

    const reviewResult = await reviewCodeWithCodex({
      code: codeContent,
      taskInfo,
      language,
    })

    // 피드백 저장
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedbacks')
      .insert({
        submission_id,
        overall_score: reviewResult.overall_score || 70,
        grade: reviewResult.grade || 'Fair',
        summary: reviewResult.summary || '코드 리뷰가 완료되었습니다.',
        code_quality: reviewResult.code_quality || {},
        strengths: reviewResult.strengths || [],
        improvements: reviewResult.improvements || [],
        next_steps: reviewResult.next_steps || [],
      })
      .select()
      .single()

    if (feedbackError) {
      console.error('Feedback insert error:', feedbackError)
      return NextResponse.json(
        { error: '피드백 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 제출 상태 업데이트
    await supabase
      .from('submissions')
      .update({ status: 'completed' })
      .eq('id', submission_id)

    return NextResponse.json({
      success: true,
      feedback,
    })

  } catch (error) {
    console.error('Feedback generate error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
