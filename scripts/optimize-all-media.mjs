import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 목표 비율: 16:8.8
const TARGET_RATIO = 16 / 8.8;

async function cropAndOptimizeImage(inputPath, outputPath, targetWidth = null) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const { width: originalWidth, height: originalHeight } = metadata;
    const currentRatio = originalWidth / originalHeight;

    let cropX = 0, cropY = 0, newWidth = originalWidth, newHeight = originalHeight;

    console.log(`\n처리 중: ${inputPath.split(/[/\\]/).pop()}`);
    console.log(`  원본: ${originalWidth}x${originalHeight} (비율: ${currentRatio.toFixed(4)})`);

    if (currentRatio > TARGET_RATIO) {
      // 현재 이미지가 더 넓음 -> 좌우를 자름
      newWidth = Math.round(originalHeight * TARGET_RATIO);
      cropX = Math.round((originalWidth - newWidth) / 2);
      console.log(`  크롭: ${newWidth}x${originalHeight} (좌우 각 ${cropX}px 제거)`);
    } else if (currentRatio < TARGET_RATIO) {
      // 현재 이미지가 더 좁음 -> 위아래를 자름
      newHeight = Math.round(originalWidth / TARGET_RATIO);
      cropY = Math.round((originalHeight - newHeight) / 2);
      console.log(`  크롭: ${originalWidth}x${newHeight} (위아래 각 ${cropY}px 제거)`);
    } else {
      console.log(`  크롭: 불필요 (이미 목표 비율)`);
    }

    let pipeline = sharp(inputPath)
      .extract({
        left: cropX,
        top: cropY,
        width: newWidth,
        height: newHeight
      });

    // 리사이즈 (옵션)
    if (targetWidth) {
      const targetHeight = Math.round(targetWidth / TARGET_RATIO);
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center'
      });
      console.log(`  리사이즈: ${targetWidth}x${targetHeight}`);
    }

    // 파일 확장자에 따라 최적화
    const ext = inputPath.toLowerCase().split('.').pop();
    if (ext === 'jpg' || ext === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 85, progressive: true });
    } else if (ext === 'webp') {
      pipeline = pipeline.webp({ quality: 85 });
    } else if (ext === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9 });
    }

    await pipeline.toFile(outputPath);

    const outputMetadata = await sharp(outputPath).metadata();
    console.log(`  ✓ 완료: ${outputMetadata.width}x${outputMetadata.height}`);

    return true;
  } catch (error) {
    console.error(`  ✗ 오류: ${error.message}`);
    return false;
  }
}

async function main() {
  const guidePath = join(__dirname, '../public/guide');
  const imagesPath = join(__dirname, '../public/images');

  console.log('=== 16:8.8 비율로 이미지 최적화 시작 ===');
  console.log(`목표 비율: ${TARGET_RATIO.toFixed(4)}\n`);

  // guide 폴더의 모든 이미지 처리
  const files = await readdir(guidePath);
  const imageFiles = files.filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );

  console.log(`\n[Guide 이미지 처리] 총 ${imageFiles.length}개`);

  let successCount = 0;
  for (const file of imageFiles) {
    const inputPath = join(guidePath, file);
    const outputPath = join(imagesPath, file);

    const success = await cropAndOptimizeImage(
      inputPath,
      outputPath,
      file.includes('step') ? 1200 : null // step 이미지는 1200px로 리사이즈
    );

    if (success) successCount++;
  }

  console.log(`\n✓ 이미지 처리 완료: ${successCount}/${imageFiles.length}`);
  console.log(`\n저장 경로: ${imagesPath}`);
}

main();
