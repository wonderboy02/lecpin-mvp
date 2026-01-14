import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    number: "01",
    title: "강의 영상 입력",
    description: "학습하고 싶은 YouTube 강의 URL을 입력하세요. AI가 강의 내용을 분석합니다.",
    icon: "🎬",
  },
  {
    number: "02",
    title: "역량 분석",
    description: "AI가 강의에서 배울 수 있는 핵심 역량을 추출하고 요약합니다.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "실습 과제 생성",
    description: "분석된 역량을 기반으로 맞춤형 실습 과제가 자동 생성됩니다.",
    icon: "📝",
  },
  {
    number: "04",
    title: "GitHub 레포 생성",
    description: "클릭 한 번으로 과제용 GitHub 저장소가 생성됩니다. README에 과제 내용이 포함됩니다.",
    icon: "🔗",
  },
  {
    number: "05",
    title: "코드 작성 & 제출",
    description: "과제를 완료하고 코드를 푸시한 후 제출 버튼을 누르세요.",
    icon: "💻",
  },
  {
    number: "06",
    title: "AI 코드 리뷰",
    description: "시니어 개발자 수준의 AI가 코드를 분석하고 상세한 피드백을 제공합니다.",
    icon: "✨",
  },
]

const faqs = [
  {
    question: "어떤 종류의 강의를 분석할 수 있나요?",
    answer: "프로그래밍, 개발, 기술 관련 YouTube 강의를 분석할 수 있습니다. 자막이 있는 강의가 더 정확한 분석이 가능합니다.",
  },
  {
    question: "GitHub 계정이 필요한가요?",
    answer: "네, GitHub 계정으로 로그인해야 합니다. 실습 과제를 위한 저장소 생성과 코드 제출에 사용됩니다.",
  },
  {
    question: "AI 피드백은 얼마나 정확한가요?",
    answer: "GPT-4o 기반으로 시니어 개발자 수준의 코드 리뷰를 제공합니다. 코드 품질, 모범 사례, 개선점 등을 종합적으로 분석합니다.",
  },
  {
    question: "한국어로 피드백을 받을 수 있나요?",
    answer: "네, 헤더에서 언어를 선택하면 영어 강의도 한국어로 분석 및 피드백을 받을 수 있습니다.",
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Lecpin 사용 가이드
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            강의를 실습으로, 실습을 성장으로
          </p>
          <Button asChild size="lg">
            <Link href="/">지금 시작하기</Link>
          </Button>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
            어떻게 작동하나요?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.number} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{step.icon}</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {step.number}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-12 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            준비되셨나요?
          </h2>
          <p className="text-muted-foreground mb-8">
            지금 바로 강의를 입력하고 실습을 시작해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">강의 분석 시작</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">GitHub로 로그인</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
