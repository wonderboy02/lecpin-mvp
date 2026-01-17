import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function cropImageTopBottom(inputPath, outputPath, topCrop, bottomCrop) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;

    console.log(`\n처리 중: ${inputPath.split(/[/\\]/).pop()}`);
    console.log(`  원본: ${width}x${height}`);

    const newHeight = height - topCrop - bottomCrop;

    console.log(`  크롭: ${width}x${newHeight} (위 ${topCrop}px, 아래 ${bottomCrop}px 제거)`);

    await sharp(inputPath)
      .extract({
        left: 0,
        top: topCrop,
        width: width,
        height: newHeight
      })
      .toFile(outputPath);

    const outputMetadata = await sharp(outputPath).metadata();
    console.log(`  ✓ 완료: ${outputMetadata.width}x${outputMetadata.height} (비율: ${(outputMetadata.width/outputMetadata.height).toFixed(4)})`);

    return true;
  } catch (error) {
    console.error(`  ✗ 오류: ${error.message}`);
    return false;
  }
}

function cropVideoTopBottom(inputPath, outputPath, topCrop, bottomCrop) {
  try {
    console.log(`\n영상 처리 중: ${inputPath.split(/[/\\]/).pop()}`);

    // ffprobe로 원본 해상도 확인
    const probeOutput = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}"`
    ).toString().trim();

    const [width, height] = probeOutput.split(',').map(Number);
    console.log(`  원본: ${width}x${height}`);

    const newHeight = height - topCrop - bottomCrop;
    const cropFilter = `crop=${width}:${newHeight}:0:${topCrop}`;

    console.log(`  크롭: ${width}x${newHeight} (위 ${topCrop}px, 아래 ${bottomCrop}px 제거)`);

    // ffmpeg로 크롭
    const ext = inputPath.toLowerCase().endsWith('.webm') ? 'webm' : 'mp4';
    const codec = ext === 'webm' ? 'libvpx-vp9' : 'libx264';

    execSync(
      `ffmpeg -i "${inputPath}" -vf "${cropFilter}" -c:v ${codec} -crf 23 -c:a copy -y "${outputPath}"`,
      { stdio: 'pipe' }
    );

    console.log(`  ✓ 완료`);
    return true;
  } catch (error) {
    console.error(`  ✗ 오류: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== 위아래 검은 줄 제거 시작 ===\n');

  // 임시 폴더 생성
  const tempPath = join(__dirname, '../temp_crop');
  if (!existsSync(tempPath)) {
    mkdirSync(tempPath, { recursive: true });
  }

  // 1. 이미지 크롭 (guide 폴더)
  // 4106x2160 이미지들: 위아래 각 60px 제거 (총 120px)
  console.log('[1단계: 이미지 크롭]');
  const guidePath = join(__dirname, '../public/guide');
  const files = await readdir(guidePath);
  const imageFiles = files.filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );

  let imageSuccess = 0;
  for (const file of imageFiles) {
    const inputPath = join(guidePath, file);
    const tempFilePath = join(tempPath, file);

    // 파일 크기에 따라 다른 크롭 적용
    const metadata = await sharp(inputPath).metadata();
    let topCrop, bottomCrop;

    if (metadata.height > 2000) {
      // 큰 이미지 (4106x2160): 위아래 각 60px
      topCrop = 60;
      bottomCrop = 60;
    } else {
      // 작은 이미지들: 비례해서 계산
      topCrop = Math.round(60 * metadata.height / 2160);
      bottomCrop = topCrop;
    }

    const success = await cropImageTopBottom(inputPath, tempFilePath, topCrop, bottomCrop);
    if (success) imageSuccess++;
  }

  console.log(`\n✓ 이미지 크롭 완료: ${imageSuccess}/${imageFiles.length}`);

  // 2. 영상 크롭
  // 2054x1080 영상: 위아래 각 30px 제거 (총 60px)
  console.log('\n\n[2단계: 영상 크롭]');
  const publicPath = join(__dirname, '../public');
  const videoFiles = ['hero-main.mp4', 'hero-main.webm', 'hero-main-optimized.mp4'];

  let videoSuccess = 0;
  for (const file of videoFiles) {
    const inputPath = join(publicPath, file);
    const tempFilePath = join(tempPath, file);

    if (existsSync(inputPath)) {
      const success = cropVideoTopBottom(inputPath, tempFilePath, 30, 30);
      if (success) videoSuccess++;
    }
  }

  console.log(`\n✓ 영상 크롭 완료: ${videoSuccess}/${videoFiles.length}`);

  console.log('\n\n[3단계: 파일 교체]');
  console.log('임시 파일들이 생성되었습니다:');
  console.log(`  ${tempPath}`);
  console.log('\n확인 후 원본 파일들을 교체하시겠습니까?');
  console.log('수동으로 temp_crop 폴더의 파일들을 확인하고 원본과 교체해주세요.');
}

main();
