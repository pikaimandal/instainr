"use client"

import useSWR from "swr"
import { useEffect } from "react"

type Balances = {
  WLD: number
  ETH: number
  "USDC.e": number
}

const STORAGE_KEY = "instainr:wallet"
type WalletState = {
  connected: boolean
  username?: string
  balances: Balances
}

const defaultState: WalletState = {
  connected: false,
  username: "pikai.1111",
  balances: { WLD: 12.34, ETH: 0.56, "USDC.e": 150 },
}

const fetcher = (key: string) => {
  if (typeof window === "undefined") return defaultState
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as WalletState) : defaultState
}

export function useWallet() {
  const { data, mutate } = useSWR<WalletState>(STORAGE_KEY, fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (!data) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  function connect() {
    mutate(
      (prev) => ({
        ...(prev ?? defaultState),
        connected: true,
        username: prev?.username ?? "pikai.1111",
      }),
      { revalidate: false },
    )
  }

  function disconnect() {
    mutate((prev) => ({ ...(prev ?? defaultState), connected: false }), { revalidate: false })
  }

  function deductBalance(sym: keyof Balances, amount: number) {
    mutate(
      (prev) => {
        const p = prev ?? defaultState
        return {
          ...p,
          balances: {
            ...p.balances,
            [sym]: Math.max(0, Number((p.balances[sym] - amount).toFixed(6))),
          },
        }
      },
      { revalidate: false },
    )
  }

  return {
    connected: data?.connected ?? false,
    username: data?.username,
    balances: data?.balances ?? defaultState.balances,
    connect,
    disconnect,
    deductBalance,
  }
}
