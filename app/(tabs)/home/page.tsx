"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { usePrices } from "@/hooks/use-prices"
import { BalancesCard } from "@/components/balances-card"
import { SellForm } from "@/components/sell-form"
import { HelpSheet } from "@/components/help-sheet"
import { User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function HomePage() {
  const { connected, username, disconnect } = useWallet()
  const router = useRouter()
  const { data: prices } = usePrices()
  
  // Redirect to splash if not connected
  useEffect(() => {
    if (!connected) {
      router.replace("/")
    }
  }, [connected, router])

  const handleLogout = () => {
    disconnect()
    router.replace("/") // Immediate redirect to splash
  }

  // Don't render home content if not connected to prevent flickering
  if (!connected) {
    return (
      <main className="mx-auto max-w-md px-4 pt-4 pb-20">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-xs text-muted-foreground">Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-4 pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm inline-flex items-center gap-1.5">
          <User className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium">{username || "World App User"}</span>
        </div>
        <div className="text-center">
          <h1 className="text-base font-semibold tracking-tight">InstaINR</h1>
        </div>
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-[11px] font-medium"
                aria-haspopup="menu"
              >
                <span>{connected ? "Connected" : "Not connected"}</span>
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={handleLogout}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <BalancesCard prices={prices} />

      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Sell your token and get INR instantly.</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <SellForm />
        </CardContent>
      </Card>

      <div className="mt-4">
        <HelpSheet />
      </div>

      {!connected && (
        <div className="fixed inset-x-0 bottom-14 mx-auto max-w-md px-4">
          <Button className="w-full">Connect to proceed</Button>
        </div>
      )}
    </main>
  )
}
