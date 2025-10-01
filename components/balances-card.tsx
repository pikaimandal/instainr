"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { formatInr } from "@/lib/format"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type Prices =
  | {
      WLD?: number
      ETH?: number
      "USDC.e"?: number
    }
  | undefined

export function BalancesCard({ prices }: { prices: Prices }) {
  const { balances, isLoadingBalances, balanceError, refreshBalances } = useWallet()
  const rows = [
    { sym: "WLD", amt: balances.WLD, price: prices?.WLD ?? 0 },
    { sym: "ETH", amt: balances.ETH, price: prices?.ETH ?? 0 },
    { sym: "USDC.e", amt: balances["USDC.e"], price: prices?.["USDC.e"] ?? 0 },
  ]

  const totalInr = rows.reduce((sum, r) => sum + r.amt * r.price, 0)

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Your Wallet</span>
          <div className="flex items-center gap-2">
            {isLoadingBalances && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {balanceError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshBalances}
                className="h-6 w-6 p-0"
                title="Retry fetching balances"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {balanceError && (
          <div className="flex items-center gap-2 p-2 mb-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-orange-700">
              Failed to load balances. Showing cached data.
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">Total (INR)</div>
          <div className="text-lg font-semibold">
            {isLoadingBalances && totalInr === 0 ? (
              <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
            ) : (
              formatInr(totalInr)
            )}
          </div>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.sym} className="flex items-center justify-between py-2">
              <div className="flex flex-col">
                <span className="font-medium">{r.sym}</span>
                <span className="text-xs text-muted-foreground">
                  1 {r.sym} = {formatInr(r.price)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {isLoadingBalances && r.amt === 0 ? (
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `${r.amt.toFixed(6)} ${r.sym}`
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoadingBalances && r.amt === 0 ? (
                    <div className="h-3 w-12 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    formatInr(r.amt * r.price)
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
