"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import SplashScreen from "@/components/splash-screen"

export default function HomePage() {
  const router = useRouter()
  const { connected } = useWallet()

  useEffect(() => {
    if (connected) {
      router.replace("/home")
    }
  }, [connected, router])

  const handleConnectionSuccess = () => {
    router.replace("/home")
  }

  // Show splash screen if not connected
  if (!connected) {
    return <SplashScreen onSuccess={handleConnectionSuccess} />
  }

  // If connected, show nothing (will redirect to /home)
  return null
}
