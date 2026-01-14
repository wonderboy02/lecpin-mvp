import { YoutubeTranscript } from 'youtube-transcript'

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
 * YouTube 자막 추출
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    // 한국어 자막 우선, 없으면 영어, 그 외 자동 생성 자막
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'ko',
    }).catch(() =>
      YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
    ).catch(() =>
      YoutubeTranscript.fetchTranscript(videoId)
    )

    // 자막 텍스트 합치기
    const transcript = transcriptItems
      .map((item) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return transcript
  } catch (error) {
    console.error('Transcript fetch error:', error)
    throw new Error('자막을 가져올 수 없습니다. 자막이 있는 영상인지 확인해주세요.')
  }
}

/**
 * YouTube URL 유효성 검사
 */
export function isValidYoutubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}
