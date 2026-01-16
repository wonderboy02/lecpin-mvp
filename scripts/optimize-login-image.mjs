import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../public/guide/hero-login.jpeg');
const outputPath = join(__dirname, '../public/images/hero-login.jpg');

async function optimizeImage() {
  try {
    // 이미지 정보 가져오기
    const metadata = await sharp(inputPath).metadata();
    console.log('원본 이미지 크기:', metadata.width, 'x', metadata.height);

    // 4:3 비율 계산
    const targetRatio = 4 / 3;
    const currentRatio = metadata.width / metadata.height;

    let cropWidth = metadata.width;
    let cropHeight = metadata.height;

    // 현재 비율이 4:3보다 넓으면 좌우를 자름
    if (currentRatio > targetRatio) {
      // 높이는 유지하고 너비를 줄임
      cropWidth = Math.round(metadata.height * targetRatio);
    } else {
      // 너비는 유지하고 높이를 줄임
      cropHeight = Math.round(metadata.width / targetRatio);
    }

    // 중앙에서 크롭
    const left = Math.round((metadata.width - cropWidth) / 2);
    const top = Math.round((metadata.height - cropHeight) / 2);

    console.log('크롭 영역:', cropWidth, 'x', cropHeight);
    console.log('크롭 시작점:', left, ',', top);

    // 이미지 처리
    await sharp(inputPath)
      .extract({
        left,
        top,
        width: cropWidth,
        height: cropHeight
      })
      .resize(1200, 900, { // 적절한 크기로 리사이즈 (4:3 비율 유지)
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);

    const outputMetadata = await sharp(outputPath).metadata();
    console.log('✓ 최적화 완료!');
    console.log('출력 이미지 크기:', outputMetadata.width, 'x', outputMetadata.height);
    console.log('출력 파일 크기:', (outputMetadata.size / 1024).toFixed(2), 'KB');
    console.log('저장 경로:', outputPath);
  } catch (error) {
    console.error('이미지 처리 중 오류 발생:', error);
    process.exit(1);
  }
}

optimizeImage();
