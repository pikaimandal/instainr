"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/lib/format"
import { ChevronDown, ChevronUp } from "lucide-react"

const FILTERS = ["All", "Processing", "Completed"] as const
type Filter = (typeof FILTERS)[number]

export default function HistoryPage() {
  const { transactions } = useTransactions()
  const [filter, setFilter] = useState<Filter>("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filter === "All" ? transactions : transactions.filter((t) => t.status === filter)

  return (
    <main className="mx-auto max-w-md px-4 pt-4 pb-24">
      {/* Filters */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setExpandedId(null)
            }}
            className={cn(
              "rounded-md px-3 py-2 text-sm border",
              filter === f ? "bg-primary text-primary-foreground" : "bg-background",
            )}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">No transactions</CardTitle>
            <CardDescription className="text-xs">Your sell orders will appear here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => {
            const isOpen = expandedId === t.id
            return (
              <Card key={t.id}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>
                      {t.token} • {t.amountToken} {t.token}
                    </span>
                    <span className="text-sm font-medium">{t.status}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatInr(t.inrNet)} • {t.methodSummary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full inline-flex items-center justify-center gap-1.5"
                    onClick={() => setExpandedId(isOpen ? null : t.id)}
                  >
                    {isOpen ? (
                      <>
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        View Details
                      </>
                    )}
                  </Button>
                  {isOpen && (
                    <div className="mt-3 border-t pt-3 text-sm space-y-2">
                      <div>
                        <span className="text-muted-foreground">TXID: </span>
                        <span className="font-mono">{t.id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reference: </span>
                        <span className="font-mono">{t.reference || t.id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        <span>{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Token: </span>
                        <span>
                          {t.amountToken} {t.token} @ ₹{t.inrPerUnit}/unit
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gross: </span>
                        <span>{formatInr(t.inrGross)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission (10%): </span>
                        <span>{formatInr(t.commissionInr)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t.status === "Completed" ? "You received" : "You will receive"}:{" "}
                        </span>
                        <span className="font-medium">{formatInr(t.inrNet)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Withdrawal method: </span>
                        <span>{t.methodSummary}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Explorer link: </span>
                        {t.explorerUrl ? (
                          <a
                            href={t.explorerUrl}
                            className="text-primary underline cursor-pointer"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Click to View
                          </a>
                        ) : (
                          <span>Click to View</span>
                        )}
                      </div>
                      {t.status === "Rejected" && t.rejectReason && (
                        <div>
                          <span className="text-muted-foreground">Reason: </span>
                          <span className="text-destructive">{t.rejectReason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
