"use client"

import Image from "next/image"
import { useState } from "react"

interface BalanceItem {
  coin: string
  icon: string
  value: number
}

interface BalanceCardProps {
  balances: BalanceItem[]
}

export default function BalanceCard({ balances }: BalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="bg-card rounded-2xl p-5 mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Balance</h2>
        <span
          className="w-8 h-8 flex items-center justify-center cursor-pointer text-text-tertiary"
          onClick={handleRefresh}
        >
          <i className={`fas fa-sync-alt ${isRefreshing ? "animate-spin" : ""}`}></i>
        </span>
      </div>
      <div>
        {balances.map((item, index) => (
          <div
            key={item.coin}
            className={`flex justify-between items-center py-3 ${
              index !== balances.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex items-center">
              <Image
                src={item.icon || "/placeholder.svg"}
                alt={item.coin}
                width={24}
                height={24}
                className="rounded-full mr-3"
              />
              <span>{item.coin}</span>
            </div>
            <div className="font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

