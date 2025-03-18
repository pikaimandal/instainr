"use client"

import Image from "next/image"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  fromCurrency: string
  amount: number
  rate: number
  networkFee: number
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  fromCurrency,
  amount,
  rate,
  networkFee,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const estimatedAmount = amount * rate
  const finalAmount = estimatedAmount - networkFee

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto animate-modalFadeIn">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="text-lg font-semibold">Confirm Conversion</h3>
          <button onClick={onClose} className="bg-transparent border-none text-text-tertiary text-lg cursor-pointer">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5">
            <div className="flex justify-between py-3 border-b border-border">
              <span>From</span>
              <span>
                {amount} {fromCurrency}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span>To</span>
              <span>₹ {estimatedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span>Exchange Rate</span>
              <span>
                1 {fromCurrency} = ₹ {rate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span>Network Fee</span>
              <span>₹ {networkFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 font-semibold text-base pt-4 mt-2 border-t border-border">
              <span>You will receive</span>
              <span>₹ {finalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-[#F0F0F8] rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3 text-sm text-text-tertiary">
              <span>Receiving Bank Account</span>
              <button className="bg-transparent border-none text-primary text-sm font-medium cursor-pointer">
                Change
              </button>
            </div>
            <div className="flex items-center">
              <Image src="/images/bank.jpg" alt="Bank Logo" width={24} height={24} className="mr-3" />
              <div>
                <div className="font-medium">State Bank of India</div>
                <div className="text-xs text-text-secondary">XXXX XXXX 5678</div>
              </div>
            </div>
          </div>

          <div className="flex items-center text-text-tertiary text-sm mb-4">
            <i className="fas fa-clock mr-2"></i>
            <span>Estimated processing time: ~60 minutes</span>
          </div>
        </div>

        <div className="flex justify-between p-5 border-t border-border">
          <button onClick={onClose} className="secondary-button w-[48%]">
            Cancel
          </button>
          <button onClick={onConfirm} className="primary-button w-[48%]">
            Confirm Conversion
          </button>
        </div>
      </div>
    </div>
  )
}

