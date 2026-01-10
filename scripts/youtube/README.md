# YouTube 재생목록 자막 다운로드 스크립트

YouTube 재생목록의 모든 비디오 자막을 로컬에 다운로드하는 스크립트입니다.

## 요구사항

- `yt-dlp` 설치 필요
- Node.js 18+

## 사용법

### 1. 재생목록 전체 다운로드

```bash
npm run fetch-youtube "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
```

### 2. 출력 위치

다운로드된 파일은 `lecture_transcription/[playlist-id]/` 폴더에 저장됩니다:

```
lecture_transcription/
└── PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf/
    ├── dQw4w9WgXcQ.ko.srt           # 한국어 자막
    ├── dQw4w9WgXcQ.info.json        # 비디오 메타데이터
    ├── abc123xyz.en.srt             # 영어 자막
    ├── abc123xyz.info.json
    └── download-summary.json        # 다운로드 결과 요약
```

## 다운로드되는 파일

- `.srt` 파일: 자막 (SubRip 형식)
- `.info.json` 파일: 비디오 메타데이터 (제목, 설명, 업로더 등)
- `download-summary.json`: 전체 다운로드 결과 요약

## 자막 언어

기본적으로 다음 순서로 자막을 다운로드합니다:
1. 한국어 자막 (ko)
2. 영어 자막 (en)

자막이 없는 비디오는 건너뜁니다.

## 문제 해결

### yt-dlp가 설치되지 않은 경우

```bash
# Windows (Scoop)
scoop install yt-dlp

# Windows (winget)
winget install yt-dlp

# macOS
brew install yt-dlp

# Linux
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 자막을 찾을 수 없는 경우

일부 비디오는 자막이 없을 수 있습니다. 이 경우 해당 비디오는 건너뛰고 `download-summary.json`에 실패로 기록됩니다.

## 다음 단계

다운로드한 자막을 데이터베이스(Prisma + SQLite/PostgreSQL)에 저장하거나, Neo4j 지식 그래프로 변환할 수 있습니다.
