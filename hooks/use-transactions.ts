"use client"

import useSWR from "swr"

type TxStatus = "Processing" | "Completed" | "Rejected"

export type Tx = {
  id: string
  token: "WLD" | "ETH" | "USDC.e"
  amountToken: number
  inrPerUnit: number
  inrGross: number
  commissionInr: number
  inrNet: number
  status: TxStatus
  methodSummary: string
  createdAt: string
  explorerUrl?: string
  rejectReason?: string
}

const STORAGE_KEY = "instainr:txs"
const COUNTER_KEY = "instainr:tx_counter"

const fetcher = (key: string) => {
  if (typeof window === "undefined") return [] as Tx[]
  const raw = localStorage.getItem(STORAGE_KEY)

  // Parse existing if present
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Tx[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      // fall through to seed demo
    }
  }

  // Demo data
  const demo: Tx[] = [
    {
      id: "IINR000001",
      token: "WLD",
      amountToken: 2,
      inrPerUnit: 350,
      inrGross: 700,
      commissionInr: 70,
      inrNet: 630,
      status: "Completed",
      methodSummary: "UPI • demo@upi",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      explorerUrl: undefined,
    },
    {
      id: "IINR000002",
      token: "ETH",
      amountToken: 0.01,
      inrPerUnit: 220000,
      inrGross: 2200,
      commissionInr: 220,
      inrNet: 1980,
      status: "Rejected",
      methodSummary: "PhonePe • +911234567890",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      rejectReason: "UPI ID not found. Please verify and try again, or contact support@instainr.app.",
    },
    {
      id: "IINR000003",
      token: "USDC.e",
      amountToken: 150,
      inrPerUnit: 83,
      inrGross: 12450,
      commissionInr: 1245,
      inrNet: 11205,
      status: "Processing",
      methodSummary: "Bank • HDFC Bank (1234)",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "IINR000004",
      token: "WLD",
      amountToken: 1.5,
      inrPerUnit: 360,
      inrGross: 540,
      commissionInr: 54,
      inrNet: 486,
      status: "Rejected",
      methodSummary: "GPay • +919876543210",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      rejectReason: "Wrong AADHAAR number. Please recheck and try again, or contact support@instainr.app.",
    },
  ]

  // Persist seeded demo and set counter to the last demo index
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    const lastIndex = 4 // matches IINR000004
    localStorage.setItem(COUNTER_KEY, String(lastIndex))
  } catch {
    // ignore storage errors
  }

  return demo
}

function nextId(): string {
  if (typeof window === "undefined") return "IINR000000"
  const n = Number.parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1
  localStorage.setItem(COUNTER_KEY, String(n))
  return `IINR${String(n).padStart(6, "0")}`
}

export function useTransactions() {
  const { data, mutate } = useSWR<Tx[]>(STORAGE_KEY, fetcher, {
    revalidateOnFocus: false,
  })

  function addTransaction(tx: Tx) {
    mutate((prev) => {
      const next = [tx, ...(prev ?? [])]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    }, false)
  }

  function setStatus(id: string, status: TxStatus, rejectReason?: string) {
    mutate((prev) => {
      const next = (prev ?? []).map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              // If rejected, use provided reason (or keep existing). Otherwise, clear it.
              rejectReason: status === "Rejected" ? (rejectReason ?? t.rejectReason) : undefined,
            }
          : t,
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    }, false)
  }

  return {
    transactions: data ?? [],
    addTransaction,
    setStatus,
    nextTxId: nextId,
  }
}
