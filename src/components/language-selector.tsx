"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { LANGUAGES, type Language } from "@/types"

const LANGUAGE_HINTS: Record<Language, string> = {
  en: "Only lecture analysis and code feedback will be displayed in English.",
  ko: "모든 AI 응답이 한국어로 표시됩니다.",
}

export function LanguageSelector() {
  const { language, setLanguage, isLoading } = useLanguage()
  const [showHint, setShowHint] = useState(false)
  const [hintMessage, setHintMessage] = useState("")

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang)
    setHintMessage(LANGUAGE_HINTS[lang])
    setShowHint(true)
  }

  // 3초 후 자동으로 힌트 닫기
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showHint])

  return (
    <Popover open={showHint} onOpenChange={setShowHint}>
      <DropdownMenu>
        <PopoverTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1.5"
              disabled={isLoading}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{currentLang.flag}</span>
            </Button>
          </DropdownMenuTrigger>
        </PopoverTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`gap-2 ${language === lang.code ? 'bg-muted' : ''}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <PopoverContent
        align="end"
        className="w-auto max-w-[240px] p-3 text-xs text-muted-foreground leading-relaxed"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {hintMessage}
      </PopoverContent>
    </Popover>
  )
}
