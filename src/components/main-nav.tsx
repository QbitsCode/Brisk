"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/docs"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/docs" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Documentation
        </Link>
        <Link
          href="/components"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/components")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Components
        </Link>
        <Link
          href="/examples"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/examples")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Examples
        </Link>
        <Link
          href="/quantum"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/quantum")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Quantum
        </Link>
        <Link
          href="/photonics"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/photonics")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Photonics
        </Link>
        <Link
          href="/perceval"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/perceval")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Perceval
        </Link>
        <Link
          href="/photonic-chip"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/photonic-chip")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Chip
        </Link>
        <Link
          href="/github"
          className={cn(
            "hidden text-foreground/60 transition-colors hover:text-foreground/80 lg:block"
          )}
        >
          GitHub
        </Link>
      </nav>
    </div>
  )
}
