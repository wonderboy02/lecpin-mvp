#!/usr/bin/env tsx

/**
 * YouTube 재생목록의 자막을 다운로드하는 스크립트
 * yt-dlp를 사용하여 자막과 메타데이터를 다운로드합니다.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_BASE_DIR = path.join(process.cwd(), 'lecture_transcription');

/**
 * 재생목록 ID 추출
 */
function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * 재생목록 전체 다운로드
 * yt-dlp가 재생목록을 알아서 처리하도록 함
 */
async function downloadPlaylist(playlistUrl: string): Promise<void> {
  console.log('🚀 YouTube 재생목록 자막 다운로드 시작\n');
  console.log(`📎 URL: ${playlistUrl}\n`);

  // 재생목록 ID 추출
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    console.error('❌ 올바른 재생목록 URL이 아닙니다.');
    process.exit(1);
  }

  // 출력 디렉토리 생성
  const outputDir = path.join(OUTPUT_BASE_DIR, playlistId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📁 출력 경로: ${outputDir}\n`);
  console.log('⏳ 다운로드 중... (각 요청 사이 10초 대기)\n');

  try {
    // yt-dlp 명령어 실행
    // --sleep-interval 10: 각 다운로드 사이 10초 대기
    // --write-auto-sub: 자동 생성 자막 다운로드
    // --write-sub: 수동 작성 자막 다운로드
    // --sub-langs "ko.*,en.*": 한국어 또는 영어 자막 우선
    // --convert-subs srt: srt 형식으로 변환
    // --write-info-json: 메타데이터 JSON 저장
    // --skip-download: 비디오는 다운로드하지 않음
    // --ignore-errors: 개별 비디오 실패 시 계속 진행
    // --no-warnings: 경고 메시지 숨기기 (선택)
    const command = `yt-dlp \
      --sleep-interval 10 \
      --write-auto-sub \
      --write-sub \
      --sub-langs "ko.*,en.*" \
      --convert-subs srt \
      --write-info-json \
      --skip-download \
      --ignore-errors \
      -o "${path.join(outputDir, '%(id)s.%(ext)s')}" \
      "${playlistUrl}"`;

    execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
      maxBuffer: 50 * 1024 * 1024
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 다운로드 완료!\n');
    console.log(`📁 저장 위치: ${outputDir}`);

    // 다운로드된 파일 확인
    const files = fs.readdirSync(outputDir);
    const srtFiles = files.filter(f => f.endsWith('.srt'));
    const jsonFiles = files.filter(f => f.endsWith('.info.json'));

    console.log(`\n📊 다운로드 결과:`);
    console.log(`  - 자막 파일: ${srtFiles.length}개`);
    console.log(`  - 메타데이터: ${jsonFiles.length}개`);

    if (srtFiles.length > 0) {
      console.log(`\n💡 첫 번째 자막 파일: ${srtFiles[0]}`);
    }

  } catch (error) {
    console.error('\n❌ 다운로드 중 오류 발생:', error);
    console.log(`\n📁 부분 다운로드된 파일은 ${outputDir}에 있을 수 있습니다.`);
    process.exit(1);
  }
}

// 메인 실행
if (require.main === module) {
  const playlistUrl = process.argv[2];

  if (!playlistUrl) {
    console.error('❌ 사용법: npm run fetch-youtube <재생목록_URL>');
    console.error('예시: npm run fetch-youtube "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"');
    process.exit(1);
  }

  downloadPlaylist(playlistUrl).catch(error => {
    console.error('❌ 실행 중 오류 발생:', error);
    process.exit(1);
  });
}

export { downloadPlaylist };
