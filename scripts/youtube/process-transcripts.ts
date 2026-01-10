#!/usr/bin/env tsx

/**
 * SRT 자막 파일을 텍스트로 정제하는 스크립트
 *
 * 처리 과정:
 * 1. 모든 원본 파일을 raw/ 폴더로 이동
 * 2. raw/*.en-orig.srt 파일에서 텍스트만 추출
 * 3. data/{video_id}.txt로 저장
 * 4. data/metadata.json 생성
 */

import * as fs from 'fs';
import * as path from 'path';

interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  uploadDate: string;
  uploader: string;
  position?: number;
}

interface PlaylistMetadata {
  playlistId: string;
  playlistTitle: string;
  videos: VideoMetadata[];
}

/**
 * SRT 파일에서 텍스트만 추출
 */
function extractTextFromSRT(srtContent: string): string {
  const lines = srtContent.split('\n');
  const textLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 빈 라인 스킵
    if (!line) continue;

    // 숫자로만 이루어진 라인 스킵 (자막 번호)
    if (/^\d+$/.test(line)) continue;

    // 타임스탬프 라인 스킵 (00:00:00,000 --> 00:00:00,000)
    if (/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/.test(line)) continue;

    // 나머지는 텍스트로 간주
    textLines.push(line);
  }

  // 중복 제거 (연속된 같은 텍스트)
  const deduplicated: string[] = [];
  let prevLine = '';

  for (const line of textLines) {
    if (line !== prevLine) {
      deduplicated.push(line);
    }
    prevLine = line;
  }

  return deduplicated.join('\n');
}

/**
 * 재생목록 폴더 처리
 */
async function processPlaylist(playlistDir: string): Promise<void> {
  console.log('🚀 Transcript 정제 작업 시작\n');
  console.log(`📁 대상 폴더: ${playlistDir}\n`);

  const playlistId = path.basename(playlistDir);
  const rawDir = path.join(playlistDir, 'raw');
  const dataDir = path.join(playlistDir, 'data');

  // raw/, data/ 폴더 생성
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('📦 Step 1: 원본 파일을 raw/ 폴더로 이동 중...\n');

  // 루트에 있는 모든 파일을 raw/로 이동 (raw/, data/ 폴더 제외)
  const allFiles = fs.readdirSync(playlistDir);
  let movedCount = 0;

  for (const file of allFiles) {
    const filePath = path.join(playlistDir, file);
    const stat = fs.statSync(filePath);

    // 디렉토리는 스킵
    if (stat.isDirectory()) continue;

    // raw/로 이동
    const destPath = path.join(rawDir, file);
    fs.renameSync(filePath, destPath);
    movedCount++;
  }

  console.log(`✅ ${movedCount}개 파일을 raw/로 이동했습니다.\n`);

  console.log('📝 Step 2: SRT 파일에서 텍스트 추출 중...\n');

  // raw/에서 .en-orig.srt 파일 찾기
  const rawFiles = fs.readdirSync(rawDir);
  const srtFiles = rawFiles.filter(f => f.endsWith('.en-orig.srt'));

  console.log(`발견된 .en-orig.srt 파일: ${srtFiles.length}개\n`);

  const videoMetadataList: VideoMetadata[] = [];

  for (const srtFile of srtFiles) {
    const videoId = srtFile.replace('.en-orig.srt', '');
    const srtPath = path.join(rawDir, srtFile);
    const txtPath = path.join(dataDir, `${videoId}.txt`);
    const jsonPath = path.join(rawDir, `${videoId}.info.json`);

    // SRT 파일 읽기 및 텍스트 추출
    const srtContent = fs.readFileSync(srtPath, 'utf-8');
    const extractedText = extractTextFromSRT(srtContent);

    // TXT 파일로 저장
    fs.writeFileSync(txtPath, extractedText, 'utf-8');

    console.log(`✅ ${videoId}.txt 생성 (${extractedText.length} bytes)`);

    // 메타데이터 읽기
    if (fs.existsSync(jsonPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        videoMetadataList.push({
          videoId,
          title: metadata.title || videoId,
          description: metadata.description || '',
          url: metadata.webpage_url || `https://www.youtube.com/watch?v=${videoId}`,
          duration: metadata.duration || 0,
          uploadDate: metadata.upload_date || '',
          uploader: metadata.uploader || metadata.channel || '',
          position: metadata.playlist_index
        });
      } catch (error) {
        console.warn(`⚠️  ${videoId}.info.json 파싱 실패`);
      }
    }
  }

  console.log(`\n📋 Step 3: metadata.json 생성 중...\n`);

  // 재생목록 메타데이터 읽기
  const playlistJsonPath = path.join(rawDir, `${playlistId}.info.json`);
  let playlistTitle = playlistId;

  if (fs.existsSync(playlistJsonPath)) {
    try {
      const playlistMetadata = JSON.parse(fs.readFileSync(playlistJsonPath, 'utf-8'));
      playlistTitle = playlistMetadata.title || playlistTitle;
    } catch (error) {
      console.warn('⚠️  재생목록 메타데이터 파싱 실패');
    }
  }

  // position으로 정렬
  videoMetadataList.sort((a, b) => (a.position || 0) - (b.position || 0));

  const playlistMetadata: PlaylistMetadata = {
    playlistId,
    playlistTitle,
    videos: videoMetadataList
  };

  const metadataPath = path.join(dataDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(playlistMetadata, null, 2), 'utf-8');

  console.log(`✅ metadata.json 생성 완료\n`);

  console.log('=' .repeat(60));
  console.log('✅ 정제 작업 완료!\n');
  console.log(`📁 원본 데이터: ${rawDir}`);
  console.log(`📁 정제된 데이터: ${dataDir}`);
  console.log(`\n📊 결과:`);
  console.log(`  - 텍스트 파일: ${srtFiles.length}개`);
  console.log(`  - 메타데이터: ${videoMetadataList.length}개 비디오`);
  console.log(`  - 재생목록: ${playlistTitle}`);
}

// 메인 실행
if (require.main === module) {
  const playlistDir = process.argv[2];

  if (!playlistDir) {
    console.error('❌ 사용법: npm run process-transcripts <재생목록_폴더_경로>');
    console.error('예시: npm run process-transcripts lecture_transcription/PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY');
    process.exit(1);
  }

  if (!fs.existsSync(playlistDir)) {
    console.error(`❌ 폴더를 찾을 수 없습니다: ${playlistDir}`);
    process.exit(1);
  }

  processPlaylist(playlistDir).catch(error => {
    console.error('❌ 실행 중 오류 발생:', error);
    process.exit(1);
  });
}

export { processPlaylist, extractTextFromSRT };
