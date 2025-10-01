"use client"

import useSWR from "swr"

type PriceResponse = {
  WLD: number
  ETH: number
  "USDC.e": number
}

type PriceError = {
  error: string
  message: string
}

const fetcher = async (url: string): Promise<PriceResponse> => {
  const response = await fetch(url)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch prices')
  }
  
  return data
}

export function usePrices() {
  return useSWR<PriceResponse>("/api/prices", fetcher, {
    refreshInterval: 60_000, // 1 min
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000, // 5 seconds
    onError: (error) => {
      console.error('Price fetching error:', error)
    }
  })
}
