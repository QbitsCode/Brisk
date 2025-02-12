import "@/styles/globals.css"
import { Metadata } from "next"
import { Inter } from "next/font/google"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { Providers } from "@/components/providers"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <Providers>
              <TooltipProvider>
                <div className="flex-1">{children}</div>
              </TooltipProvider>
            </Providers>
            <footer className="border-t border-border bg-card mt-12">
              <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6 text-sm">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built by Qbits. All rights reserved.
                  </p>
                </div>
                <nav className="flex items-center gap-4 text-sm">
                  <a
                    href="https://github.com/codeium/brisk"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://codeium.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Website
                  </a>
                </nav>
              </div>
            </footer>
          </div>
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}
