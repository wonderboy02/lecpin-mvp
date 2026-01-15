'use client'

import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language-selector"
import Link from "next/link"

export function Header() {
  const { user, profile, loading, signOut, isLoggedIn } = useUser()

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity"
        >
          LECPIN
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              시작하기
            </Link>
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                내 학습
              </Link>
            )}
            <Link
              href="/guide"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              가이드
            </Link>
          </nav>

          {/* Language Selector */}
          <LanguageSelector />

          {!loading && (
            <>
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0 hover:bg-muted"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                          alt={profile?.name || '사용자'}
                        />
                        <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                          {(profile?.name || profile?.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.name || profile?.github_username || '사용자'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email || user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">내 학습</Link>
                    </DropdownMenuItem>
                    {profile?.github_username && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://github.com/${profile.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm"
                        >
                          GitHub Profile
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-sm text-destructive focus:text-destructive"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-sm font-normal h-8 px-3"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
