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

## 미리보기

```bash
npm run dev
# http://localhost:3000/design-system 접속
```

---

## 컬러 시스템

### Light Mode

| Token | 용도 |
|-------|-----|
| `foreground` | 제목, 본문 텍스트 (deep charcoal) |
| `muted-foreground` | 보조 텍스트 |
| `muted` | 배경, 플레이스홀더 |
| `accent` | CTA 버튼, 중요 링크 (coral) |
| `background` | 페이지 배경 (warm white) |

### 사용 예시

```jsx
<p className="text-foreground">주 텍스트</p>
<p className="text-muted-foreground">보조 텍스트</p>
<div className="bg-muted">배경</div>
<button className="bg-accent text-accent-foreground">버튼</button>
```

---

## 타이포그래피

### Display (Serif)

Noto Serif KR을 사용합니다. 헤드라인과 타이틀에 사용.

```jsx
<h1 className="font-serif text-5xl font-semibold tracking-tight">
  헤드라인
</h1>
```

### Body (Sans-serif)

Pretendard를 사용합니다. 본문과 UI 요소에 사용.

```jsx
<p className="text-lg leading-relaxed">본문 텍스트</p>
```

### Caption/Label

```jsx
<p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
  LABEL TEXT
</p>
```

---

## 이미지

### 플레이스홀더

```jsx
{/* 16:9 Hero */}
<div className="aspect-video bg-muted rounded-sm">
  {/* 권장 이미지 주석 */}
</div>

{/* 4:3 Card */}
<div className="aspect-[4/3] bg-muted rounded-sm">
  {/* 권장 이미지 주석 */}
</div>

{/* 1:1 Avatar */}
<div className="aspect-square bg-muted rounded-sm">
  {/* 권장 이미지 주석 */}
</div>

{/* 3:4 Portrait */}
<div className="aspect-[3/4] bg-muted rounded-sm">
  {/* 권장 이미지 주석 */}
</div>
```

### 실제 이미지

```jsx
import Image from 'next/image'

<div className="aspect-video relative">
  <Image
    src="/images/hero.webp"
    alt="설명"
    fill
    className="object-cover"
    priority
  />
</div>
```

자세한 가이드는 [IMAGE-GUIDELINES.md](./IMAGE-GUIDELINES.md) 참조.

---

## 컴포넌트

### 버튼

```jsx
import { Button } from "@/components/ui/button"

<Button>Primary</Button>
<Button variant="outline">Secondary</Button>
```

### 카드

```jsx
import { Card, CardContent } from "@/components/ui/card"

<Card className="card-hover">
  <div className="aspect-[4/3] bg-muted" />
  <CardContent className="p-5">
    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
      Category
    </p>
    <h3 className="font-medium">Title</h3>
  </CardContent>
</Card>
```

### 구분선

```jsx
{/* 얇은 선 */}
<div className="divider" />

{/* 두꺼운 선 (섹션 구분) */}
<div className="h-0.5 bg-foreground" />
```

---

## 애니메이션

절제된 모션을 사용합니다.

```jsx
<div className="animate-fade-in">
  페이드 인
</div>

{/* Stagger 효과 */}
<div className="animate-fade-in animate-delay-100">1</div>
<div className="animate-fade-in animate-delay-200">2</div>
<div className="animate-fade-in animate-delay-300">3</div>
```

---

## 파일 구조

```
src/
├── app/
│   ├── design-system/
│   │   └── page.tsx          # 디자인 시스템 미리보기
│   └── globals.css           # 디자인 토큰 및 스타일
│
└── design-system/
    ├── IMAGE-GUIDELINES.md   # 이미지 사용 가이드
    └── README.md             # 이 문서
```

---

## 체크리스트

새 페이지/컴포넌트 제작 시 확인:

- [ ] 그라데이션 사용하지 않았는가?
- [ ] 이모지 대신 텍스트나 사진을 사용했는가?
- [ ] Serif(헤드라인)와 Sans(본문)를 구분했는가?
- [ ] 이미지 플레이스홀더에 권장 사진 주석을 작성했는가?
- [ ] 충분한 여백을 확보했는가?
- [ ] 악센트 컬러를 과하게 사용하지 않았는가?
