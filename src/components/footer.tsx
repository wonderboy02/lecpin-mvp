export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Lecpin</span>
            <span className="mx-2 text-border">|</span>
            AI 기반 실습 학습 플랫폼
          </p>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              이용약관
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              개인정보처리방침
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              문의
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
