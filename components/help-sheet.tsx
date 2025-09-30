"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function HelpSheet() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          How it works
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>How InstaINR works</DialogTitle>
        </DialogHeader>
        <ol className="text-sm list-decimal ml-4 mt-2 space-y-2">
          <li>Connect your World App wallet.</li>
          <li>Choose a token (WLD, ETH, USDC.e) and amount.</li>
          <li>Select payout method (UPI, PhonePe, PayTM, GPay, or Bank).</li>
          <li>Enter Aadhaar number as KYC proof (format: XXXX XXXX XXXX).</li>
          <li>Confirm sell. Processing typically completes within 30 minutes.</li>
        </ol>
        <p className="text-sm text-muted-foreground mt-3">
          Need help? Email support at{" "}
          <a className="underline" href="mailto:support@instainr.app">
            support@instainr.app
          </a>
        </p>
      </DialogContent>
    </Dialog>
  )
}
