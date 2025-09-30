"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { formatInr } from "@/lib/format"

type Prices =
  | {
      WLD?: number
      ETH?: number
      "USDC.e"?: number
    }
  | undefined

export function BalancesCard({ prices }: { prices: Prices }) {
  const { balances } = useWallet()
  const rows = [
    { sym: "WLD", amt: balances.WLD, price: prices?.WLD ?? 0 },
    { sym: "ETH", amt: balances.ETH, price: prices?.ETH ?? 0 },
    { sym: "USDC.e", amt: balances["USDC.e"], price: prices?.["USDC.e"] ?? 0 },
  ]

  const totalInr = rows.reduce((sum, r) => sum + r.amt * r.price, 0)

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Your Wallet</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">Total (INR)</div>
          <div className="text-lg font-semibold">{formatInr(totalInr)}</div>
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
                  {r.amt} {r.sym}
                </div>
                <div className="text-xs text-muted-foreground">{formatInr(r.amt * r.price)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
