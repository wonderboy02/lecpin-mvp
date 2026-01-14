export function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-auto bg-card">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">코드코치</span> - AI 기반 개발 실습 플랫폼 (컨셉 데모)
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            이용약관
          </a>
          <span>|</span>
          <a href="#" className="hover:text-primary transition-colors">
            개인정보처리방침
          </a>
          <span>|</span>
          <a href="#" className="hover:text-primary transition-colors">
            문의하기
          </a>
        </div>
      </div>
    </footer>
  )
}
