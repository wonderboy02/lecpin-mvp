import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg font-semibold mb-3">LECPIN</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI와 함께하는<br />
              실습 중심 학습 플랫폼
            </p>
          </div>

          {/* Service */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              서비스
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  강의 분석
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  실습 과제
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI 피드백
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              지원
            </p>
            <ul className="space-y-2">
              <li>
                <a href="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  이용 가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              법적 고지
            </p>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            2025 LECPIN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
