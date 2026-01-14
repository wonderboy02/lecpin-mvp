import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lecpin | AI \uc2e4\uc2b5 \ucf54\uce58",
  description: "\uac15\uc758\ub97c \ubcf4\uace0 \ubc14\ub85c \uc2e4\uc2b5\ud558\uc138\uc694. AI\uac00 \ub9de\ucda4 \ucf54\ub529 \uacfc\uc81c\ub97c \uc0dd\uc131\ud558\uace0 \uc2dc\ub2c8\uc5b4 \uac1c\ubc1c\uc790\ucc98\ub7fc \ud53c\ub4dc\ubc31\ud569\ub2c8\ub2e4.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Pretendard Variable - Modern Korean Typography */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* JetBrains Mono for code */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
