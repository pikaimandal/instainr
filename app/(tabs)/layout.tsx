"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Home, History } from "lucide-react"

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const active = (href: string) => pathname === href || pathname.startsWith(href)

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1">{children}</div>

      {/* Bottom Tabs */}
      <nav className="sticky bottom-0 left-0 right-0 border-t bg-background" aria-label="Primary">
        <div className="mx-auto max-w-md grid grid-cols-2">
          <Link
            href="/home"
            className={cn(
              "flex flex-col items-center justify-center py-2.5 gap-1 text-xs",
              active("/home") ? "text-primary" : "text-muted-foreground",
            )}
            aria-current={active("/home") ? "page" : undefined}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/history"
            className={cn(
              "flex flex-col items-center justify-center py-2.5 gap-1 text-xs",
              active("/history") ? "text-primary" : "text-muted-foreground",
            )}
            aria-current={active("/history") ? "page" : undefined}
          >
            <History className="h-5 w-5" />
            <span>History</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
