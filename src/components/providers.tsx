"use client"

import { LanguageProvider } from "@/contexts/language-context"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
