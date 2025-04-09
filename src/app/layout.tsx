import "@/styles/globals.css"
import { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { Providers } from "@/components/providers"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/components/auth"
import { NextAuthProvider } from "@/components/auth/NextAuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon_io/favicon.ico?v=2",
    shortcut: "/favicon_io/favicon-16x16.png?v=2",
    apple: "/favicon_io/apple-touch-icon.png?v=2",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
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
          <NextAuthProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <Providers>
                <TooltipProvider>
                  <div className="flex-1">{children}</div>
                </TooltipProvider>
              </Providers>
            <footer className="border-t border-border bg-card mt-12">
              <div className="container flex flex-col items-center justify-center py-6 md:h-24 md:py-0">
                <p className="text-center text-sm leading-loose text-muted-foreground">
                  Built by Qbits. All rights reserved.
                </p>
              </div>
            </footer>
              </div>
              <TailwindIndicator />
            </AuthProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
