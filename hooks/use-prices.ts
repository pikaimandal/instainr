"use client"

import useSWR from "swr"

type PriceResponse = {
  WLD: number
  ETH: number
  "USDC.e": number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function usePrices() {
  return useSWR<PriceResponse>("/api/prices", fetcher, {
    refreshInterval: 60_000, // 1 min
    revalidateOnFocus: false,
  })
}
