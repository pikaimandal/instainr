"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { useMiniKit } from "@/components/minikit-provider"

export default function SplashPage() {
  const router = useRouter()
  const { connected, connect } = useWallet()
  const { isInitialized, isInstalled } = useMiniKit()
  const [showButton, setShowButton] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Show button only after MiniKit is initialized and minimum 2 seconds have passed
    if (isInitialized) {
      const t = setTimeout(() => setShowButton(true), 2000)
      return () => clearTimeout(t)
    }
  }, [isInitialized])

  useEffect(() => {
    if (connected) {
      router.replace("/home")
    }
  }, [connected, router])

  // Don't render splash content if already connected to prevent flickering
  if (connected) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xs text-muted-foreground">Redirecting...</p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Image src="/images/instainr-logo.jpg" alt="InstaINR logo" width={84} height={84} priority />
        <h1 className="text-2xl font-semibold tracking-tight">InstaINR</h1>
        <p className="text-sm text-muted-foreground max-w-sm">Sell WLD, ETH, and USDC.e for instant INR payouts.</p>
      </div>
      {showButton && isInstalled ? (
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            className="rounded-lg"
            disabled={isConnecting}
            onClick={async () => {
              setIsConnecting(true)
              setError(null)
              try {
                await connect()
                router.replace("/home")
              } catch (err) {
                setError(err instanceof Error ? err.message : "Connection failed")
                setIsConnecting(false)
              }
            }}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          {error && (
            <p className="text-xs text-destructive text-center max-w-sm">
              {error}
            </p>
          )}
        </div>
      ) : showButton && !isInstalled ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please open this app in World App to connect your wallet.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Getting ready…</p>
      )}
      <p className="text-[11px] text-muted-foreground mt-8">
        By continuing you agree to our{" "}
        <button type="button" onClick={() => setShowTerms(true)} className="underline text-foreground hover:opacity-90">
          Terms of Service
        </button>{" "}
        &{" "}
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="underline text-foreground hover:opacity-90"
        >
          Privacy Policy
        </button>
        .
      </p>

      {showTerms ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tos-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowTerms(false)
          }}
          onClick={(e) => {
            if (e.currentTarget === e.target) setShowTerms(false)
          }}
          tabIndex={-1}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border bg-background text-foreground shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 id="tos-title" className="text-sm font-semibold">
                Terms of Service
              </h2>
              <button
                className="rounded p-1 hover:opacity-80"
                aria-label="Close terms dialog"
                onClick={() => setShowTerms(false)}
              >
                {"✕"}
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-4 py-3 text-sm leading-relaxed">
              <p className="text-muted-foreground">
                This Terms of Service text is placeholder content for demo purposes. Replace with your official Terms of
                Service. By using InstaINR, you agree to abide by these terms including permitted use, payment terms,
                and limitations of liability.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-muted-foreground">
                <li>Eligibility and account responsibilities</li>
                <li>Prohibited activities and compliance requirements</li>
                <li>Payment, fees, refunds, and chargebacks</li>
                <li>Disclaimers and limitation of liability</li>
                <li>Governing law and dispute resolution</li>
              </ul>
            </div>
            <div className="flex justify-end border-t px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => setShowTerms(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showPrivacy ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowPrivacy(false)
          }}
          onClick={(e) => {
            if (e.currentTarget === e.target) setShowPrivacy(false)
          }}
          tabIndex={-1}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border bg-background text-foreground shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 id="privacy-title" className="text-sm font-semibold">
                Privacy Policy
              </h2>
              <button
                className="rounded p-1 hover:opacity-80"
                aria-label="Close privacy dialog"
                onClick={() => setShowPrivacy(false)}
              >
                {"✕"}
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-4 py-3 text-sm leading-relaxed">
              <p className="text-muted-foreground">
                This Privacy Policy text is placeholder content for demo purposes. Replace with your official Privacy
                Policy. We explain what data we collect, why we collect it, and how it is used, stored, and protected.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-muted-foreground">
                <li>Information we collect and lawful basis</li>
                <li>How we use data and retention periods</li>
                <li>Data sharing, processors, and third parties</li>
                <li>Your rights and how to exercise them</li>
                <li>Contact details and updates to this policy</li>
              </ul>
            </div>
            <div className="flex justify-end border-t px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => setShowPrivacy(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
