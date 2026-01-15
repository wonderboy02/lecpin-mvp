# LECPIN Design System

에디토리얼/매거진 스타일의 디자인 시스템입니다.
**AI 티를 완전히 배제**하고, 사진 중심의 미감 있는 디자인을 지향합니다.

---

## 디자인 철학

### 핵심 원칙

1. **No Gradient** - 그라데이션 완전 배제
2. **No Emoji/Icon Overuse** - 이모지, 아이콘 최소화
3. **Photo-First** - 사진 중심의 비주얼 커뮤니케이션
4. **Editorial Tone** - 매거진처럼 고급스럽고 절제된 톤

### 피해야 할 것 (AI Slop)

- 보라색/파란색 그라데이션
- 과도한 이모지 사용
- 뻔한 아이콘 나열
- Inter, Roboto 등 기본 폰트
- 과도한 둥근 모서리
- 화려한 애니메이션

---

## 파일 구조

```
design-system/
├── design-tokens.css    # 색상, 타이포그래피, 스페이싱 토큰
├── IMAGE-GUIDELINES.md  # 이미지 사용 가이드라인
└── README.md            # 이 문서

app/design-system/
├── layout.tsx           # 디자인 시스템 레이아웃
└── page.tsx             # 디자인 시스템 미리보기 페이지
```

---

## Quick Start

### 1. 폰트 설정

`app/layout.tsx`에서 Noto Serif KR 폰트를 추가하세요:

```tsx
import { Noto_Serif_KR } from "next/font/google"

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### 2. CSS 임포트

```css
/* globals.css 또는 원하는 CSS 파일에서 */
@import "../design-system/design-tokens.css";
```

### 3. 미리보기

```bash
npm run dev
# http://localhost:3000/design-system 접속
```

---

## 컬러 시스템

### Ink (Neutral)

따뜻한 톤의 흑백 팔레트입니다.

| Token     | 용도              |
|-----------|------------------|
| ink-900   | 제목, 본문 텍스트  |
| ink-700   | 중요한 보조 텍스트 |
| ink-500   | Muted 텍스트      |
| ink-300   | 비활성 요소       |
| ink-100   | 배경, 구분선      |

### Accent

딥 레드 톤의 악센트 컬러입니다.

| Token        | 용도                |
|--------------|---------------------|
| accent       | CTA 버튼, 중요 링크  |
| accent-light | 호버 상태           |
| accent-muted | 배경 하이라이트     |

### Paper

순백이 아닌 약간 따뜻한 아이보리 톤입니다.

---

## 타이포그래피

### Display (Serif)

Noto Serif KR을 사용합니다. 헤드라인과 타이틀에 사용하여 고급스러운 느낌을 줍니다.

```html
<h1 class="text-display-xl">대제목 56px</h1>
<h2 class="text-display-lg">중제목 40px</h2>
<h3 class="text-display-md">소제목 30px</h3>
<h4 class="text-display-sm">작은제목 24px</h4>
```

### Body (Sans-serif)

Pretendard를 사용합니다. 본문과 UI 요소에 사용합니다.

```html
<p class="text-body-lg">큰 본문 18px</p>
<p class="text-body-md">기본 본문 16px</p>
<p class="text-body-sm">작은 본문 14px</p>
```

### UI & Caption

```html
<span class="text-ui-lg">UI 텍스트 16px</span>
<span class="text-ui-md">UI 텍스트 14px</span>
<span class="text-ui-sm">UI 텍스트 12px</span>
<span class="text-caption">캡션 11px UPPERCASE</span>
```

---

## 컴포넌트

### 버튼

```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-text">Text Link</button>
```

### 카드

```html
<div class="card-editorial">
  <div class="img-placeholder img-card"></div>
  <div class="p-5">
    <p class="text-caption mb-2">카테고리</p>
    <h3 class="text-ui-lg">카드 제목</h3>
  </div>
</div>
```

### 인풋

```html
<input type="text" class="input-editorial" placeholder="입력하세요" />
<textarea class="input-editorial"></textarea>
```

### 구분선

```html
<div class="divider"></div>      <!-- 얇은 선 -->
<div class="divider-thick"></div> <!-- 두꺼운 선 -->
```

---

## 이미지

### 플레이스홀더

```html
<div class="img-placeholder img-hero">
  <!-- 권장 이미지 주석 작성 -->
</div>

<div class="img-placeholder img-card"></div>
<div class="img-placeholder img-square"></div>
<div class="img-placeholder img-portrait"></div>
<div class="img-placeholder img-wide"></div>
```

### 비율 (Aspect Ratio)

| Class        | 비율  | 용도              |
|--------------|-------|-------------------|
| img-hero     | 16:9  | 히어로, 배너      |
| img-card     | 4:3   | 카드 썸네일       |
| img-square   | 1:1   | 프로필, 아바타    |
| img-portrait | 3:4   | 인물 사진         |
| img-wide     | 21:9  | 와이드 배너       |

### 이미지 처리

```html
<img src="..." class="img-cover img-editorial" />  <!-- 필름 느낌 -->
<img src="..." class="img-cover img-bw" />         <!-- 흑백 -->
```

---

## 스페이싱

### 섹션 간격

```html
<section class="section-gap-xl">...</section>  <!-- 96px -->
<section class="section-gap-lg">...</section>  <!-- 64px -->
<section class="section-gap-md">...</section>  <!-- 40px -->
<section class="section-gap-sm">...</section>  <!-- 24px -->
```

### 콘텐츠 너비

```html
<div class="content-narrow mx-auto">...</div>  <!-- 672px - 읽기 최적 -->
<div class="content-medium mx-auto">...</div>  <!-- 896px -->
<div class="content-wide mx-auto">...</div>    <!-- 1152px -->
<div class="content-full mx-auto">...</div>    <!-- 1440px -->
```

---

## 애니메이션

절제된 모션을 사용합니다.

```html
<div class="animate-fade-in">페이드 인</div>
<div class="animate-slide-up">슬라이드 업</div>

<!-- Stagger 효과 -->
<div class="animate-fade-in animate-stagger-1">1</div>
<div class="animate-fade-in animate-stagger-2">2</div>
<div class="animate-fade-in animate-stagger-3">3</div>
```

---

## 체크리스트

새 페이지/컴포넌트 제작 시 확인하세요:

- [ ] 그라데이션 사용하지 않았는가?
- [ ] 이모지 대신 텍스트나 사진을 사용했는가?
- [ ] Display 폰트(Serif)와 Body 폰트(Sans)를 적절히 구분했는가?
- [ ] 이미지 플레이스홀더에 권장 사진 주석을 작성했는가?
- [ ] 충분한 여백을 확보했는가?
- [ ] 악센트 컬러를 과하게 사용하지 않았는가?
