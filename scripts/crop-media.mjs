import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 목표 비율들
const IMAGE_RATIO = 4 / 3.9; // 1.0256...
const VIDEO_RATIO = 16 / 8.8; // 1.8182...

async function cropImage(inputPath, outputPath, targetRatio) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const { width: originalWidth, height: originalHeight } = metadata;
    const currentRatio = originalWidth / originalHeight;

    let cropX = 0, cropY = 0, newWidth = originalWidth, newHeight = originalHeight;

    console.log(`\n처리 중: ${inputPath.split(/[/\\]/).pop()}`);
    console.log(`  원본: ${originalWidth}x${originalHeight} (비율: ${currentRatio.toFixed(4)})`);

    if (currentRatio > targetRatio) {
      // 현재 이미지가 더 넓음 -> 좌우를 자름
      newWidth = Math.round(originalHeight * targetRatio);
      cropX = Math.round((originalWidth - newWidth) / 2);
      console.log(`  크롭: ${newWidth}x${originalHeight} (좌우 각 ${cropX}px 제거)`);
    } else if (currentRatio < targetRatio) {
      // 현재 이미지가 더 좁음 -> 위아래를 자름
      newHeight = Math.round(originalWidth / targetRatio);
      cropY = Math.round((originalHeight - newHeight) / 2);
      console.log(`  크롭: ${originalWidth}x${newHeight} (위아래 각 ${cropY}px 제거)`);
    } else {
      console.log(`  크롭: 불필요 (이미 목표 비율)`);
      // 그래도 복사
      await sharp(inputPath).toFile(outputPath);
      console.log(`  ✓ 복사 완료`);
      return true;
    }

    await sharp(inputPath)
      .extract({
        left: cropX,
        top: cropY,
        width: newWidth,
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

function cropVideo(inputPath, outputPath, targetRatio) {
  try {
    console.log(`\n영상 처리 중: ${inputPath.split(/[/\\]/).pop()}`);

    // ffprobe로 원본 해상도 확인
    const probeOutput = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}"`
    ).toString().trim();

    const [width, height] = probeOutput.split(',').map(Number);
    const currentRatio = width / height;

    console.log(`  원본: ${width}x${height} (비율: ${currentRatio.toFixed(4)})`);

    let cropFilter;
    if (currentRatio > targetRatio) {
      // 좌우 크롭
      const newWidth = Math.round(height * targetRatio);
      const cropX = Math.round((width - newWidth) / 2);
      cropFilter = `crop=${newWidth}:${height}:${cropX}:0`;
      console.log(`  크롭: ${newWidth}x${height} (좌우 각 ${cropX}px 제거)`);
    } else {
      // 위아래 크롭
      const newHeight = Math.round(width / targetRatio);
      const cropY = Math.round((height - newHeight) / 2);
      cropFilter = `crop=${width}:${newHeight}:0:${cropY}`;
      console.log(`  크롭: ${width}x${newHeight} (위아래 각 ${cropY}px 제거)`);
    }

    // ffmpeg로 크롭
    const ext = inputPath.toLowerCase().endsWith('.webm') ? 'webm' : 'mp4';
    const codec = ext === 'webm' ? 'libvpx-vp9' : 'libx264';

    execSync(
      `ffmpeg -i "${inputPath}" -vf "${cropFilter}" -c:v ${codec} -c:a copy -y "${outputPath}"`,
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
  console.log('=== 미디어 파일 크롭 시작 ===\n');
  console.log(`이미지 목표 비율: 4:3.9 = ${IMAGE_RATIO.toFixed(4)}`);
  console.log(`영상 목표 비율: 16:8.8 = ${VIDEO_RATIO.toFixed(4)}`);

  // 1. 이미지 크롭 (guide 폴더 -> guide 폴더에 덮어쓰기)
  console.log('\n\n[1단계: 이미지 크롭]');
  const guidePath = join(__dirname, '../public/guide');
  const files = await readdir(guidePath);
  const imageFiles = files.filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );

  let imageSuccess = 0;
  for (const file of imageFiles) {
    const inputPath = join(guidePath, file);
    const outputPath = join(guidePath, file); // 덮어쓰기

    const success = await cropImage(inputPath, outputPath, IMAGE_RATIO);
    if (success) imageSuccess++;
  }

  console.log(`\n✓ 이미지 크롭 완료: ${imageSuccess}/${imageFiles.length}`);

  // 2. 영상 크롭
  console.log('\n\n[2단계: 영상 크롭]');
  const publicPath = join(__dirname, '../public');
  const videoFiles = ['hero-main.mp4', 'hero-main.webm', 'hero-main-optimized.mp4'];

  let videoSuccess = 0;
  for (const file of videoFiles) {
    const inputPath = join(publicPath, file);
    const outputPath = join(publicPath, file); // 덮어쓰기

    try {
      // 임시 파일로 크롭 후 원본 교체
      const tempPath = join(publicPath, `temp_${file}`);
      const success = cropVideo(inputPath, tempPath, VIDEO_RATIO);
      if (success) {
        execSync(`mv "${tempPath}" "${outputPath}"`);
        videoSuccess++;
      }
    } catch (error) {
      console.error(`영상 처리 실패: ${file} - ${error.message}`);
    }
  }

  console.log(`\n✓ 영상 크롭 완료: ${videoSuccess}/${videoFiles.length}`);

  console.log('\n\n=== 모든 작업 완료 ===');
}

main();
