import type { Metadata } from "next"
import "../globals.css"
import "../../design-system/design-tokens.css"

export const metadata: Metadata = {
  title: "Design System | LECPIN",
  description: "LECPIN 디자인 시스템 미리보기",
}

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
