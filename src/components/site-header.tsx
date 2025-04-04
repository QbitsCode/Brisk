"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal, UserProfile, CommunityShared } from "@/components/auth"
import { useAuth } from "@/components/auth"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <div className="mr-2 flex items-center space-x-2">
              <CommunityShared />

              {/* UserProfile will render when logged in, AuthModal will render when not logged in */}
              <UserProfile />
              <AuthModal />
            </div>

            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.x className="h-4 w-4 fill-current" />
              <span className="sr-only">X (formerly Twitter)</span>
            </Link>
            <Link
              href="https://github.com/QbitsCode/Brisk"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.github className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
