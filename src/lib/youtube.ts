import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * YouTube URL에서 Video ID 추출
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // 직접 ID 입력
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * YouTube 썸네일 URL 생성
 */
export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * 자막 목록에서 특정 언어의 수동/자동 자막 존재 여부 확인
 */
function parseSubtitleAvailability(listOutput: string, lang: string): { hasManual: boolean; hasAuto: boolean } {
  const lines = listOutput.split('\n')
  let inManualSection = false
  let inAutoSection = false
  let hasManual = false
  let hasAuto = false

  for (const line of lines) {
    // 섹션 헤더 감지 - 더 정확한 패턴 사용
    // "Available subtitles for VIDEO_ID:" = 수동 자막 섹션
    // "Available automatic captions for VIDEO_ID:" = 자동 자막 섹션
    if (line.includes('Available subtitles for')) {
      inManualSection = true
      inAutoSection = false
      continue
    }
    if (line.includes('Available automatic captions for')) {
      inManualSection = false
      inAutoSection = true
      continue
    }

    // "Language" 헤더 행은 스킵 (테이블 헤더)
    if (line.trim().startsWith('Language')) {
      continue
    }

    // 해당 언어 자막 확인 (언어 코드로 시작하는 행)
    const langPattern = new RegExp(`^${lang}\\s+`)
    if (langPattern.test(line.trim())) {
      if (inManualSection) hasManual = true
      if (inAutoSection) hasAuto = true
    }
  }

  return { hasManual, hasAuto }
}

/**
 * 자막 목록에서 원본 언어 감지 (수동 자막이 있는 언어 = 원본 언어)
 */
function detectOriginalLanguage(listOutput: string): string | null {
  const lines = listOutput.split('\n')
  let inManualSection = false

  for (const line of lines) {
    // 수동 자막 섹션 헤더 감지
    if (line.includes('Available subtitles for')) {
      inManualSection = true
      continue
    }
    if (line.includes('Available automatic captions for')) {
      inManualSection = false
      continue
    }

    // "Language" 헤더 행은 스킵
    if (line.trim().startsWith('Language')) {
      continue
    }

    // 수동 자막 섹션에서 첫 번째 언어 코드 추출
    if (inManualSection) {
      const match = line.trim().match(/^([a-z]{2}(-[A-Za-z]+)?)\s+/)
      if (match) {
        return match[1].split('-')[0] // 'ko-KR' -> 'ko'
      }
    }
  }

  return null
}

/**
 * 자동 자막에서 원본 언어 감지 (첫 번째 언어 = 원본 언어)
 * YouTube는 자동 자막 목록에서 원본 언어를 첫 번째로 보여줌
 */
function detectOriginalFromAutoCaption(listOutput: string): string | null {
  const lines = listOutput.split('\n')
  let inAutoSection = false

  for (const line of lines) {
    if (line.includes('Available automatic captions for')) {
      inAutoSection = true
      continue
    }
    if (line.includes('Available subtitles for')) {
      inAutoSection = false
      continue
    }

    // "Language" 헤더 행은 스킵
    if (line.trim().startsWith('Language')) {
      continue
    }

    // 자동 자막 섹션에서 첫 번째 언어 = 원본 언어
    if (inAutoSection) {
      const match = line.trim().match(/^([a-z]{2}(-[A-Za-z]+)?)\s+/)
      if (match) {
        return match[1].split('-')[0]
      }
    }
  }

  return null
}

/**
 * yt-dlp를 사용하여 YouTube 자막 추출
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/watch?v=${videoId}`

  // 사용 가능한 자막 언어 확인
  console.log(`[yt-dlp] Checking available subtitles for ${videoId}...`)

  try {
    // 자막 목록 확인
    const { stdout: listOutput } = await execAsync(
      `yt-dlp --list-subs --skip-download -- "${url}"`,
      { timeout: 30000 }
    )
    console.log(`[yt-dlp] Available subtitles:\n${listOutput}`)

    // 원본 언어 감지 (수동 자막 > 자동 자막의 orig 표시)
    const originalLang = detectOriginalLanguage(listOutput) || detectOriginalFromAutoCaption(listOutput)
    console.log(`[yt-dlp] Detected original language: ${originalLang || 'unknown'}`)

    // 지원 언어: en, ko만 사용
    // 원본이 en/ko면 원본 우선, 아니면 en 우선
    const supportedLanguages = ['en', 'ko']
    const languages = originalLang && supportedLanguages.includes(originalLang)
      ? [originalLang, ...supportedLanguages.filter(l => l !== originalLang)]
      : supportedLanguages // 기본: en > ko

    console.log(`[yt-dlp] Language priority: ${languages.join(' > ')}`)

    // 임시 파일 방식으로 자막 추출 (Windows 호환성)
    return await fetchTranscriptWithTempFile(videoId, url, listOutput, languages)

  } catch (error) {
    console.error('[yt-dlp] Error:', error)
    throw new Error('자막을 가져올 수 없습니다. 자막이 있는 영상인지 확인해주세요.')
  }
}

/**
 * 임시 파일을 사용하여 자막 추출
 */
async function fetchTranscriptWithTempFile(
  videoId: string,
  url: string,
  listOutput: string,
  languages: string[]
): Promise<string> {
  const os = await import('os')
  const fs = await import('fs/promises')
  const path = await import('path')

  const tempDir = os.tmpdir()
  const baseName = `yt-sub-${videoId}-${Date.now()}`

  // 각 언어별로 시도
  for (const lang of languages) {
    const availability = parseSubtitleAvailability(listOutput, lang)
    console.log(`[yt-dlp] ${lang} subtitle availability:`, availability)

    if (!availability.hasManual && !availability.hasAuto) {
      console.log(`[yt-dlp] No ${lang} subtitles available, trying next language...`)
      continue
    }

    const subFlag = availability.hasManual ? '--write-sub' : '--write-auto-sub'
    const subType = availability.hasManual ? 'manual' : 'auto-generated'

    try {
      const cmd = `yt-dlp ${subFlag} --sub-lang ${lang} --sub-format vtt --skip-download -o "${path.join(tempDir, baseName)}" -- "${url}"`
      console.log(`[yt-dlp] Running: ${cmd}`)

      const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 })
      console.log(`[yt-dlp] stdout: ${stdout}`)
      if (stderr) console.log(`[yt-dlp] stderr: ${stderr}`)

      // 다운로드된 자막 파일 찾기
      const files = await fs.readdir(tempDir)
      const subFiles = files.filter(f => f.startsWith(baseName) && (f.endsWith('.vtt') || f.endsWith('.srt')))

      console.log(`[yt-dlp] Found subtitle files:`, subFiles)

      if (subFiles.length === 0) {
        console.log(`[yt-dlp] No subtitle files found for ${lang}, trying next language...`)
        continue
      }

      // 해당 언어 파일 찾기
      const targetFile = subFiles.find(f => f.includes(`.${lang}.`) || f.includes(`.${lang}-`)) || subFiles[0]
      const filePath = path.join(tempDir, targetFile)
      const content = await fs.readFile(filePath, 'utf-8')

      console.log(`[yt-dlp] Raw VTT content (${content.length} chars):`)
      console.log(content.slice(0, 500))

      // 임시 파일 정리
      for (const file of subFiles) {
        try {
          await fs.unlink(path.join(tempDir, file))
        } catch {}
      }

      const transcript = parseVTT(content)
      if (!transcript) {
        console.log(`[yt-dlp] parseVTT returned empty for ${lang}, trying next language...`)
        continue
      }

      console.log(`[yt-dlp] Successfully fetched ${lang} ${subType} subtitles (${transcript.length} chars)`)
      console.log(`[yt-dlp] Parsed transcript preview: ${transcript.slice(0, 300)}`)
      return transcript

    } catch (langError) {
      console.error(`[yt-dlp] Failed to fetch ${lang} subtitles:`, langError)
      continue
    }
  }

  throw new Error('사용 가능한 자막이 없습니다. (en, ko)')
}

/**
 * VTT/SRT 자막 파일 파싱
 */
function parseVTT(content: string): string {
  // VTT 헤더 및 타임스탬프 제거
  const lines = content
    .replace(/WEBVTT[\s\S]*?\n\n/, '') // VTT 헤더 제거
    .replace(/^\d+\s*\n/gm, '') // SRT 인덱스 제거
    .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}/g, '') // 타임스탬프 제거
    .replace(/<[^>]+>/g, '') // HTML 태그 제거
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^(NOTE|STYLE|REGION)/)) // 메타데이터 제거

  // 중복 제거 및 연결
  const uniqueLines: string[] = []
  for (const line of lines) {
    if (line && uniqueLines[uniqueLines.length - 1] !== line) {
      uniqueLines.push(line)
    }
  }

  return uniqueLines.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * YouTube URL 유효성 검사
 */
export function isValidYoutubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}
