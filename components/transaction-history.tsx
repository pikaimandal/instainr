"use client"

import { useState } from "react"

interface Transaction {
  id: string
  type: string
  fromCurrency: string
  fromAmount: number
  toAmount: number
  date: string
  time: string
  status: "pending" | "completed"
  timeRemaining?: number
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true
    return transaction.status === filter
  })

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      
      <div className="flex mb-4 bg-[#F0F0F8] p-1 rounded-full">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2 px-4 rounded-full text-center transition-colors ${
            filter === "all" 
              ? "bg-white text-text-primary shadow-sm" 
              : "text-text-secondary"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`flex-1 py-2 px-4 rounded-full text-center transition-colors ${
            filter === "pending" 
              ? "bg-white text-text-primary shadow-sm" 
              : "text-text-secondary"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`flex-1 py-2 px-4 rounded-full text-center transition-colors ${
            filter === "completed" 
              ? "bg-white text-text-primary shadow-sm" 
              : "text-text-secondary"
          }`}
        >
          Completed
        </button>
      </div>
      
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                transaction.status === "completed" ? "bg-success/10" : "bg-warning/10"
              }`}>
                {transaction.status === "completed" ? (
                  <i className="fas fa-check text-success"></i>
                ) : (
                  <i className="fas fa-clock text-warning"></i>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{transaction.type}</div>
                <div className="text-sm text-text-tertiary">
                  {transaction.date} • {transaction.time}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {transaction.fromAmount} {transaction.fromCurrency}
                </div>
                <div className="text-sm font-medium text-text-primary">
                  ₹ {transaction.toAmount.toFixed(2)}
                </div>
              </div>
            </div>
            
            {transaction.status === "pending" && transaction.timeRemaining && (
              <div className="flex items-center text-xs text-warning">
                <i className="fas fa-hourglass-half mr-1"></i>
                <span>{transaction.timeRemaining} minutes remaining</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

