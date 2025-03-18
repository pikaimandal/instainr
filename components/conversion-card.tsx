"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ConfirmationModal from "./confirmation-modal"

interface ConversionCardProps {
  balances: {
    coin: string
    value: number
  }[]
  onConversionComplete: () => void
}

export default function ConversionCard({ balances, onConversionComplete }: ConversionCardProps) {
  const [selectedCoin, setSelectedCoin] = useState("USDT")
  const [amount, setAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("0.00")
  const [showModal, setShowModal] = useState(false)

  // Exchange rates (would come from API in real app)
  const rates = {
    WLD: 425.32,
    ETH: 185290.45,
    USDT: 83.25,
  }

  // Network fee
  const networkFee = 10

  useEffect(() => {
    updateEstimatedAmount()
  }, [amount, selectedCoin])

  const updateEstimatedAmount = () => {
    const amountValue = Number.parseFloat(amount) || 0
    const rate = rates[selectedCoin as keyof typeof rates]
    const estimated = amountValue * rate
    setReceiveAmount(estimated.toFixed(2))
  }

  // Get max balance for selected coin
  const getMaxBalance = () => {
    const selectedBalance = balances.find(b => b.coin === selectedCoin)
    return selectedBalance?.value || 0
  }

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  // Handle blur to validate max amount
  const handleAmountBlur = () => {
    const maxBalance = getMaxBalance()
    const numAmount = parseFloat(amount)
    if (numAmount > maxBalance) {
      setAmount(maxBalance.toString())
    }
  }

  // Handle max button click
  const handleMaxClick = () => {
    const maxBalance = getMaxBalance()
    setAmount(maxBalance.toString())
  }

  const handleConvertClick = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      // Show error notification
      return
    }
    setShowModal(true)
  }

  const handleConfirmConversion = () => {
    setShowModal(false)
    // Reset form
    setAmount("")
    setReceiveAmount("0.00")
    // Navigate to history screen
    onConversionComplete()
  }

  return (
    <>
      <div className="bg-card rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-semibold mb-5">Convert to INR</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col mb-4">
            <label className="text-sm text-text-tertiary mb-2">From</label>
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="h-12 px-4 border border-border rounded-lg text-base text-text-primary bg-white w-full relative cursor-pointer"
            >
              {balances.map((balance) => (
                <option key={balance.coin} value={balance.coin}>
                  {balance.coin}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-sm text-text-tertiary mb-2">Amount</label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="0"
                className="h-12 px-4 border border-border rounded-lg text-base text-text-primary bg-white w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1 rounded text-sm font-medium"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="w-8 h-8 rounded-full bg-[#F0F0F8] flex items-center justify-center">
              <i className="fas fa-arrow-down text-primary"></i>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-text-tertiary mb-2">To</label>
            <div className="h-12 border border-border rounded-lg flex items-center px-4 bg-[#F0F0F8]">
              <Image src="/images/inricon.png" alt="INR" width={24} height={24} className="mr-3" />
              <span>INR</span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-text-tertiary mb-2">You will receive (estimated)</label>
            <div className="h-12 border border-border rounded-lg flex items-center px-4 text-lg font-semibold text-text-primary">
              ₹ {receiveAmount}
            </div>
          </div>

          <div className="bg-[#F0F0F8] rounded-lg p-4">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text-tertiary">Exchange Rate</span>
              <span className="font-medium">
                1 {selectedCoin} = ₹ {rates[selectedCoin as keyof typeof rates].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text-tertiary">Network Fee</span>
              <span className="font-medium">₹ {networkFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Processing Time</span>
              <span className="font-medium">~60 minutes</span>
            </div>
          </div>

          <button onClick={handleConvertClick} className="primary-button">
            Convert Now
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmConversion}
        fromCurrency={selectedCoin}
        amount={Number.parseFloat(amount) || 0}
        rate={rates[selectedCoin as keyof typeof rates]}
        networkFee={networkFee}
      />
    </>
  )
}

