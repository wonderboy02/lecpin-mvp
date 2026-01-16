const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const guideDir = path.join(__dirname, '../public/guide');
const files = fs.readdirSync(guideDir);

async function optimizeImages() {
  console.log('🖼️  이미지 최적화 시작...\n');

  for (const file of files) {
    if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;

    const inputPath = path.join(guideDir, file);
    const fileName = path.parse(file).name;
    const ext = path.parse(file).ext.toLowerCase();

    try {
      // 원본 파일 크기
      const originalStats = fs.statSync(inputPath);
      const originalSize = (originalStats.size / 1024).toFixed(2);

      // JPG/PNG 최적화 (원본 덮어쓰기)
      if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(inputPath)
          .jpeg({ quality: 85, progressive: true })
          .toFile(inputPath + '.tmp');
      } else if (ext === '.png') {
        await sharp(inputPath)
          .png({ quality: 85, compressionLevel: 9 })
          .toFile(inputPath + '.tmp');
      }

      // 최적화된 파일로 교체
      fs.renameSync(inputPath + '.tmp', inputPath);

      // WebP 변환 (추가 생성)
      const webpPath = path.join(guideDir, `${fileName}.webp`);
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(webpPath);

      // 최적화 후 크기 확인
      const optimizedStats = fs.statSync(inputPath);
      const optimizedSize = (optimizedStats.size / 1024).toFixed(2);
      const webpStats = fs.statSync(webpPath);
      const webpSize = (webpStats.size / 1024).toFixed(2);

      const reduction = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   원본: ${originalSize}KB → 최적화: ${optimizedSize}KB (${reduction}% 감소)`);
      console.log(`   WebP: ${webpSize}KB\n`);
    } catch (error) {
      console.error(`❌ ${file} 최적화 실패:`, error.message);
    }
  }

  console.log('✨ 이미지 최적화 완료!');
}

optimizeImages();
