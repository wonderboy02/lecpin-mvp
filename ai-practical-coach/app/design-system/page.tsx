"use client"

/**
 * LECPIN Design System 미리보기 페이지
 *
 * 에디토리얼/매거진 스타일 디자인 시스템
 * - 그라데이션 없음
 * - 이모지/아이콘 최소화
 * - 사진 중심의 비주얼
 */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="content-wide mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-display-sm">LECPIN</span>
          <nav className="flex gap-8">
            <a href="#" className="text-ui-md text-muted-foreground hover:text-foreground transition-colors">강의</a>
            <a href="#" className="text-ui-md text-muted-foreground hover:text-foreground transition-colors">학습</a>
            <a href="#" className="text-ui-md text-muted-foreground hover:text-foreground transition-colors">피드백</a>
          </nav>
        </div>
      </header>

      <main className="content-wide mx-auto px-6">
        {/* Hero Section */}
        <section className="section-gap-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <p className="text-caption mb-4">AI 실습 코치</p>
              <h1 className="text-display-xl mb-6">
                강의를 보고<br />
                바로 실습하세요
              </h1>
              <p className="text-body-lg text-muted-foreground mb-8 max-w-md">
                AI가 맞춤 코딩 과제를 생성하고 시니어 개발자처럼 피드백합니다.
                이론을 넘어 실전 역량을 기르세요.
              </p>
              <div className="flex gap-4">
                <button className="btn-primary">시작하기</button>
                <button className="btn-secondary">자세히 보기</button>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="img-placeholder img-hero rounded-sm animate-slide-up">
              {/*
                권장 이미지: 노트북 앞에서 코딩하는 사람의 옆모습
                - 자연광이 들어오는 창가나 카페 환경
                - 화면에는 코드 에디터가 살짝 보이는 정도
                - 집중하는 자연스러운 모습 (얼굴 노출 최소화)
                - 미니멀한 데스크 셋업

                검색 키워드: "developer working natural light", "coding cafe laptop"
                추천 소스: Unsplash, Pexels
              */}
            </div>
          </div>
        </section>

        <div className="divider-thick" />

        {/* Features Section */}
        <section className="section-gap-lg">
          <div className="max-w-2xl mb-12">
            <p className="text-caption mb-3">학습 프로세스</p>
            <h2 className="text-display-lg mb-4">어떻게 동작하나요?</h2>
            <p className="text-body-md text-muted-foreground">
              강의 영상을 입력하면 AI가 핵심 역량을 분석하고,
              여러분에게 딱 맞는 실습 과제를 생성합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="animate-fade-in animate-stagger-1">
              <div className="img-placeholder img-card rounded-sm mb-6">
                {/*
                  권장 이미지: YouTube 또는 강의 플레이어 화면
                  - 코딩 관련 강의 영상이 재생되는 화면
                  - 화면 자체보다 분위기 위주
                  - 옆에 노트나 펜이 있으면 좋음

                  검색 키워드: "online course laptop", "video learning desk"
                */}
              </div>
              <p className="text-caption mb-2">Step 01</p>
              <h3 className="text-display-sm mb-3">강의 입력</h3>
              <p className="text-body-sm text-muted-foreground">
                YouTube 강의 URL을 입력하면 AI가 자동으로 내용을 분석합니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="animate-fade-in animate-stagger-2">
              <div className="img-placeholder img-card rounded-sm mb-6">
                {/*
                  권장 이미지: 분석/인사이트를 시각화한 장면
                  - 화이트보드에 다이어그램
                  - 노트에 마인드맵이나 구조화된 필기
                  - 깔끔한 차트나 그래프가 그려진 종이

                  검색 키워드: "whiteboard diagram", "notes mindmap", "planning sketch"
                */}
              </div>
              <p className="text-caption mb-2">Step 02</p>
              <h3 className="text-display-sm mb-3">역량 분석</h3>
              <p className="text-body-sm text-muted-foreground">
                강의에서 다루는 핵심 역량과 개념을 구조화하여 보여드립니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="animate-fade-in animate-stagger-3">
              <div className="img-placeholder img-card rounded-sm mb-6">
                {/*
                  권장 이미지: 실습/코딩하는 모습
                  - 코드 에디터 화면 클로즈업
                  - 키보드 타이핑하는 손
                  - 터미널에서 코드 실행하는 화면

                  검색 키워드: "coding hands keyboard", "code editor dark theme", "terminal programming"
                */}
              </div>
              <p className="text-caption mb-2">Step 03</p>
              <h3 className="text-display-sm mb-3">실습 과제</h3>
              <p className="text-body-sm text-muted-foreground">
                배운 내용을 바로 적용할 수 있는 맞춤형 실습 과제를 생성합니다.
              </p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Testimonial / Quote Section */}
        <section className="section-gap-lg">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="img-placeholder img-portrait rounded-sm">
                {/*
                  권장 이미지: 학습자 또는 개발자 인물 사진
                  - 자연스러운 환경에서 촬영된 인물
                  - 카메라를 직접 보지 않는 캔디드 스타일
                  - 노트북이나 코딩 환경과 함께
                  - 진지하게 집중하는 모습

                  검색 키워드: "developer portrait candid", "software engineer working"
                */}
              </div>
            </div>

            {/* Quote */}
            <div className="lg:col-span-3 flex flex-col justify-center">
              <blockquote className="text-display-md mb-8 leading-relaxed">
                "강의만 봤을 때는 이해한 것 같았는데,
                실습 과제를 풀어보니 부족한 부분이 명확히 보였어요.
                AI 피드백 덕분에 혼자서도 성장할 수 있었습니다."
              </blockquote>
              <div>
                <p className="text-ui-lg">김개발</p>
                <p className="text-body-sm text-muted-foreground">프론트엔드 개발자 취업 준비생</p>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Cards Grid */}
        <section className="section-gap-lg">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-caption mb-3">추천 강의</p>
              <h2 className="text-display-lg">지금 인기 있는 강의</h2>
            </div>
            <button className="btn-text">전체 보기</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "React 완벽 가이드",
                category: "프론트엔드",
                duration: "12시간",
                imageNote: "React 로고가 있는 모니터 또는 컴포넌트 구조 다이어그램"
              },
              {
                title: "TypeScript 마스터",
                category: "프론트엔드",
                duration: "8시간",
                imageNote: "타입스크립트 코드가 보이는 에디터 화면 (다크 테마)"
              },
              {
                title: "Node.js 백엔드",
                category: "백엔드",
                duration: "15시간",
                imageNote: "서버 터미널 화면 또는 API 테스트 도구 화면"
              },
              {
                title: "알고리즘 기초",
                category: "CS 기초",
                duration: "10시간",
                imageNote: "손으로 그린 알고리즘 플로우차트나 화이트보드"
              }
            ].map((course, i) => (
              <article key={i} className="card-editorial group cursor-pointer">
                <div className="img-placeholder img-card">
                  {/*
                    각 카드별 이미지 권장 사항은 imageNote 참조
                    공통 가이드:
                    - 직접적인 강의 내용보다 분위기 전달
                    - 너무 선명한 코드보다 살짝 흐린 배경 선호
                    - 해당 기술의 특성이 느껴지는 이미지
                  */}
                </div>
                <div className="p-5">
                  <p className="text-caption mb-2">{course.category}</p>
                  <h3 className="text-ui-lg mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground">{course.duration}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="divider-thick" />

        {/* CTA Section */}
        <section className="section-gap-xl text-center">
          <h2 className="text-display-lg mb-4">지금 시작하세요</h2>
          <p className="text-body-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            이론에서 실전으로. AI와 함께 진짜 실력을 기르세요.
          </p>
          <button className="btn-primary">무료로 시작하기</button>
        </section>

        {/* Form Elements Preview */}
        <section className="section-gap-lg">
          <h2 className="text-display-md mb-8">Form Elements</h2>
          <div className="max-w-md space-y-6">
            <div>
              <label className="text-ui-sm block mb-2">강의 URL</label>
              <input
                type="text"
                className="input-editorial"
                placeholder="YouTube 강의 URL을 입력하세요"
              />
            </div>
            <div>
              <label className="text-ui-sm block mb-2">설명</label>
              <textarea
                className="input-editorial min-h-[120px] resize-none"
                placeholder="추가 설명을 입력하세요"
              />
            </div>
            <div className="flex gap-4">
              <button className="btn-primary">분석하기</button>
              <button className="btn-secondary">취소</button>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section className="section-gap-lg">
          <h2 className="text-display-md mb-8">Typography Scale</h2>
          <div className="space-y-8">
            <div>
              <p className="text-caption mb-2">Display XL (56px)</p>
              <p className="text-display-xl">강의를 보고 바로 실습하세요</p>
            </div>
            <div>
              <p className="text-caption mb-2">Display LG (40px)</p>
              <p className="text-display-lg">AI가 맞춤 과제를 생성합니다</p>
            </div>
            <div>
              <p className="text-caption mb-2">Display MD (30px)</p>
              <p className="text-display-md">핵심 역량을 분석하고 구조화합니다</p>
            </div>
            <div>
              <p className="text-caption mb-2">Display SM (24px)</p>
              <p className="text-display-sm">실전 피드백으로 성장하세요</p>
            </div>
            <div className="divider" />
            <div>
              <p className="text-caption mb-2">Body LG (18px)</p>
              <p className="text-body-lg">이 텍스트는 본문에 사용됩니다. 충분한 행간과 함께 가독성을 확보합니다. Pretendard 폰트를 사용하여 한글과 영문 모두 깔끔하게 표현합니다.</p>
            </div>
            <div>
              <p className="text-caption mb-2">Body MD (16px)</p>
              <p className="text-body-md">기본 본문 텍스트입니다. 대부분의 텍스트 콘텐츠에 이 사이즈를 사용합니다. 읽기 편한 크기와 행간을 유지합니다.</p>
            </div>
            <div>
              <p className="text-caption mb-2">Body SM (14px)</p>
              <p className="text-body-sm">작은 본문 텍스트입니다. 보조 설명이나 메타 정보에 사용됩니다.</p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="section-gap-lg">
          <h2 className="text-display-md mb-8">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="h-20 rounded-sm mb-2" style={{ backgroundColor: 'oklch(0.12 0.005 60)' }} />
              <p className="text-ui-sm">ink-900</p>
              <p className="text-caption">Primary Text</p>
            </div>
            <div>
              <div className="h-20 rounded-sm mb-2" style={{ backgroundColor: 'oklch(0.45 0.002 60)' }} />
              <p className="text-ui-sm">ink-500</p>
              <p className="text-caption">Muted Text</p>
            </div>
            <div>
              <div className="h-20 rounded-sm mb-2 border border-border" style={{ backgroundColor: 'oklch(0.94 0.001 60)' }} />
              <p className="text-ui-sm">ink-100</p>
              <p className="text-caption">Backgrounds</p>
            </div>
            <div>
              <div className="h-20 rounded-sm mb-2" style={{ backgroundColor: 'oklch(0.48 0.18 15)' }} />
              <p className="text-ui-sm">accent</p>
              <p className="text-caption">Primary Action</p>
            </div>
            <div>
              <div className="h-20 rounded-sm mb-2 border border-border" style={{ backgroundColor: 'oklch(0.985 0.005 85)' }} />
              <p className="text-ui-sm">paper</p>
              <p className="text-caption">Page Background</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="content-wide mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="text-display-sm mb-4">LECPIN</p>
              <p className="text-body-sm text-muted-foreground">
                AI와 함께하는 실습 중심 학습 플랫폼
              </p>
            </div>
            <div>
              <p className="text-ui-md mb-4">서비스</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-body-sm text-muted-foreground hover:text-foreground">강의 분석</a></li>
                <li><a href="#" className="text-body-sm text-muted-foreground hover:text-foreground">실습 과제</a></li>
                <li><a href="#" className="text-body-sm text-muted-foreground hover:text-foreground">AI 피드백</a></li>
              </ul>
            </div>
            <div>
              <p className="text-ui-md mb-4">회사</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-body-sm text-muted-foreground hover:text-foreground">소개</a></li>
                <li><a href="#" className="text-body-sm text-muted-foreground hover:text-foreground">채용</a></li>
                <li><a href="#" className="text-body-sm text-muted-foreground hover:text-foreground">블로그</a></li>
              </ul>
            </div>
            <div>
              <p className="text-ui-md mb-4">문의</p>
              <p className="text-body-sm text-muted-foreground">support@lecpin.com</p>
            </div>
          </div>
          <div className="divider" />
          <p className="text-body-sm text-muted-foreground">
            2025 LECPIN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
