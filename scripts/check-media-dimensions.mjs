import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkImageDimensions(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    const ratio = metadata.width / metadata.height;
    return {
      width: metadata.width,
      height: metadata.height,
      ratio: ratio.toFixed(4),
      ratioDisplay: `${metadata.width}:${metadata.height}`,
      size: metadata.size
    };
  } catch (error) {
    return null;
  }
}

async function main() {
  const guidePath = join(__dirname, '../public/guide');

  console.log('=== 이미지 파일 분석 ===\n');

  const files = await readdir(guidePath);
  const imageFiles = files.filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );

  for (const file of imageFiles) {
    const filePath = join(guidePath, file);
    const info = await checkImageDimensions(filePath);

    if (info) {
      console.log(`${file}:`);
      console.log(`  크기: ${info.width} x ${info.height}`);
      console.log(`  비율: ${info.ratio} (${info.ratioDisplay})`);
      console.log(`  예상 정확한 비율: 16:${(16 / parseFloat(info.ratio)).toFixed(2)}`);
      console.log(`  파일크기: ${(info.size / 1024).toFixed(2)} KB`);
      console.log('');
    }
  }

  // 16:8.8 비율 계산
  const targetRatio = 16 / 8.8;
  console.log(`\n=== 목표 비율 ===`);
  console.log(`16:8.8 = ${targetRatio.toFixed(4)}`);
}

main();
