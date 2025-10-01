"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { usePrices } from "@/hooks/use-prices"
import { useTransactions } from "@/hooks/use-transactions"
import { formatInr } from "@/lib/format"
import { MiniKit, MiniAppPaymentSuccessPayload, ResponseEvent } from "@worldcoin/minikit-js"

type Token = "WLD" | "ETH" | "USDC.e"
type Method =
  | { type: "UPI"; upiId: string }
  | { type: "PhonePe"; phone: string }
  | { type: "PayTM"; phone: string }
  | { type: "GPay"; phone: string }
  | { type: "Bank"; bankName: string; accountNumber: string; ifsc: string }

export function SellForm() {
  const { balances, deductBalance, connected } = useWallet()
  const { data: prices } = usePrices()
  const [token, setToken] = useState<Token>("WLD")
  const [amount, setAmount] = useState<string>("") // token amount
  const [methodType, setMethodType] = useState<Method["type"]>("UPI")
  const [upiId, setUpiId] = useState("")
  const [phoneDigits, setPhoneDigits] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [ifsc, setIfsc] = useState("")
  const [aadhaar, setAadhaar] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const { addTransaction, nextTxId } = useTransactions()

  // Ensure ETH is never selected
  useEffect(() => {
    if (token === "ETH") {
      setToken("WLD")
    }
  }, [token])

  const pricePerUnit =
    token === "WLD" ? (prices?.WLD ?? 0) : token === "ETH" ? (prices?.ETH ?? 0) : (prices?.["USDC.e"] ?? 0)

  const maxAvailable = token === "WLD" ? balances.WLD : token === "ETH" ? balances.ETH : balances["USDC.e"]

  const amountNum = Number(amount || "0")
  const grossInr = amountNum * pricePerUnit
  const commissionInr = Math.round(grossInr * 0.1)
  const netInr = Math.max(0, grossInr - commissionInr)

  const meetsMin = grossInr >= 500
  const withinBalance = amountNum <= maxAvailable
  const amountValid = amount !== "" && amountNum > 0 && withinBalance

  const upiValid = methodType !== "UPI" || /^[\w.-]{2,}@[A-Za-z]{2,}$/.test(upiId.trim())
  const phoneCombined = `+91${phoneDigits}`
  const phoneValid =
    (methodType !== "PhonePe" && methodType !== "PayTM" && methodType !== "GPay") || /^\+91\d{10}$/.test(phoneCombined)
  const ifscValid = methodType !== "Bank" || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())
  const accountValid = methodType !== "Bank" || /^[0-9]{9,18}$/.test(accountNumber)
  const bankNameValid = methodType !== "Bank" || bankName.trim().length >= 2

  const aadhaarValid = /^\d{4}\s\d{4}\s\d{4}$/.test(aadhaar)

  const canSubmit =
    connected &&
    amountValid &&
    meetsMin &&
    withinBalance &&
    upiValid &&
    phoneValid &&
    ifscValid &&
    accountValid &&
    bankNameValid &&
    aadhaarValid &&
    token !== "ETH" &&
    !isProcessingPayment

  function formatAadhaarInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 12)
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "))
  }

  function onPhoneChangeDigits(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 10)
    setPhoneDigits(digits)
  }

  function methodSummary(m: Method) {
    switch (m.type) {
      case "UPI":
        return `UPI • ${m.upiId}`
      case "PhonePe":
      case "PayTM":
      case "GPay":
        return `${m.type} • ${m.phone}`
      case "Bank":
        return `Bank • ${m.bankName} (${m.accountNumber.slice(-4)})`
    }
  }

  const handlePayment = async () => {
    if (!canSubmit || isProcessingPayment) return
    
    setIsProcessingPayment(true)
    
    try {
      const method: Method =
        methodType === "UPI"
          ? { type: "UPI", upiId: upiId.trim() }
          : methodType === "Bank"
            ? {
                type: "Bank",
                bankName: bankName.trim(),
                accountNumber,
                ifsc: ifsc.toUpperCase(),
              }
            : { type: methodType, phone: phoneCombined }

      // Step 1: Initiate payment on backend
      const initiateResponse = await fetch('/api/initiate-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          amount,
          methodSummary: methodSummary(method)
        }),
      })

      if (!initiateResponse.ok) {
        const error = await initiateResponse.json()
        throw new Error(error.error || 'Failed to initiate payment')
      }

      const paymentData = await initiateResponse.json()

      // Step 2: Set up payment response listener
      const handlePaymentResponse = async (payload: MiniAppPaymentSuccessPayload) => {
        try {
          // Step 3: Verify payment on backend
          const confirmResponse = await fetch('/api/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payload: payload
            }),
          })

          const confirmResult = await confirmResponse.json()

          if (confirmResult.success) {
            // Payment successful - add to transaction history
            const id = nextTxId()
            addTransaction({
              id,
              token,
              amountToken: Number(amount),
              inrPerUnit: pricePerUnit,
              inrGross: Math.round(grossInr),
              commissionInr,
              inrNet: Math.round(netInr),
              status: "Completed",
              methodSummary: methodSummary(method),
              createdAt: new Date().toISOString(),
              explorerUrl: confirmResult.explorerUrl,
            })
            
            // Deduct balance locally
            deductBalance(token, Number(amount))
            
            // Reset form
            setAmount("")
            setUpiId("")
            setPhoneDigits("")
            setBankName("")
            setAccountNumber("")
            setIfsc("")
            setAadhaar("")
            
          } else {
            throw new Error(confirmResult.error || 'Payment verification failed')
          }
        } catch (error) {
          console.error('Payment confirmation error:', error)
          alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
          setIsProcessingPayment(false)
        }
      }

      // Set up event listeners
      MiniKit.subscribe(ResponseEvent.MiniAppPayment, (payload: any) => {
        if (payload.status === 'success') {
          handlePaymentResponse(payload as MiniAppPaymentSuccessPayload)
        } else {
          console.error('Payment error:', payload)
          alert(`Payment failed: ${payload.message || 'Unknown error'}`)
          setIsProcessingPayment(false)
        }
      })

      // Send MiniKit Pay command
      MiniKit.commands.pay({
        reference: paymentData.referenceId,
        to: paymentData.to,
        tokens: paymentData.tokens,
        description: `Sell ${amount} ${token} for INR`
      })

    } catch (error) {
      console.error('Payment initiation error:', error)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsProcessingPayment(false)
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        handlePayment()
      }}
    >
      {/* Token selector */}
      <div className="grid grid-cols-3 gap-2">
        {(["WLD", "ETH", "USDC.e"] as Token[]).map((sym) => (
          <button
            type="button"
            key={sym}
            onClick={() => setToken(sym)}
            disabled={sym === "ETH"}
            className={
              token === sym
                ? "rounded-md px-3 py-2 text-sm border bg-primary text-primary-foreground"
                : sym === "ETH"
                  ? "rounded-md px-3 py-2 text-sm border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "rounded-md px-3 py-2 text-sm border"
            }
            aria-pressed={token === sym}
          >
            {sym}
          </button>
        ))}
      </div>
      
      {/* ETH restriction message */}
      {token === "ETH" && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">
            Currently, you can't sell ETH for INR
          </p>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount ({token})</Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "")
            const parts = v.split(".")
            const clean = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : v
            setAmount(clean)
          }}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Available: {maxAvailable} {token}
          </span>
          <button type="button" className="underline" onClick={() => setAmount(String(maxAvailable))}>
            Max
          </button>
        </div>
        {!withinBalance && <p className="text-xs text-destructive">Exceeds available balance</p>}
      </div>

      {/* Payout method */}
      <div className="space-y-1.5">
        <Label>Payout Method</Label>
        <div className="grid grid-cols-5 gap-2">
          {(["UPI", "PhonePe", "PayTM", "GPay", "Bank"] as Method["type"][]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethodType(m)}
              className={
                methodType === m
                  ? "rounded-md px-2 py-2 text-[11px] border bg-primary text-primary-foreground"
                  : "rounded-md px-2 py-2 text-[11px] border"
              }
              aria-pressed={methodType === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {methodType === "UPI" && (
        <div className="space-y-1.5">
          <Label htmlFor="upi">UPI ID</Label>
          <Input id="upi" placeholder="name@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          {!upiValid && <p className="text-xs text-destructive">Enter a valid UPI ID</p>}
        </div>
      )}

      {(methodType === "PhonePe" || methodType === "PayTM" || methodType === "GPay") && (
        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile Number</Label>
          <div className="flex items-center gap-2">
            <span className="px-2 py-2 border rounded-md text-sm select-none">+91</span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              value={phoneDigits}
              onChange={(e) => onPhoneChangeDigits(e.target.value)}
              maxLength={10}
            />
          </div>
          {!phoneValid && <p className="text-xs text-destructive">Enter a valid 10-digit number</p>}
        </div>
      )}

      {methodType === "Bank" && (
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="bank">Bank Name</Label>
            <Input
              id="bank"
              placeholder="e.g., HDFC Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acct">Account Number</Label>
            <Input
              id="acct"
              inputMode="numeric"
              placeholder="###########"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 18))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifsc">IFSC</Label>
            <Input
              id="ifsc"
              placeholder="ABCD0EFG123"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              maxLength={11}
            />
            {!ifscValid && <p className="text-xs text-destructive">Enter a valid IFSC</p>}
          </div>
        </div>
      )}

      {/* Aadhaar */}
      <div className="space-y-1.5">
        <Label htmlFor="aadhaar">Aadhaar (KYC)</Label>
        <Input
          id="aadhaar"
          inputMode="numeric"
          placeholder="XXXX XXXX XXXX"
          value={aadhaar}
          onChange={(e) => setAadhaar(formatAadhaarInput(e.target.value))}
          maxLength={14}
        />
        {!aadhaarValid && aadhaar.length > 0 && <p className="text-xs text-destructive">Format: XXXX XXXX XXXX</p>}
      </div>

      {/* Conversion info */}
      <Card className="border-dashed">
        <CardContent className="pt-4 text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span>Amount to sell</span>
            <span className="font-medium">
              {amount || "0"} {token}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Processing time</span>
            <span className="font-medium">Up to 30 minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Commission (10%)</span>
            <span className="font-medium">{formatInr(commissionInr)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>You will receive</span>
            <span className="font-semibold">{formatInr(netInr)}</span>
          </div>
        </CardContent>
      </Card>

      {!meetsMin && amountNum > 0 && <p className="text-xs text-destructive">Minimum conversion is ₹500</p>}

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {isProcessingPayment ? "Processing Payment..." : "Confirm Sell"}
      </Button>
    </form>
  )
}
