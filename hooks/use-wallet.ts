"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

type Balances = {
  WLD: number
  ETH: number
  "USDC.e": number
}

type WalletState = {
  connected: boolean
  username?: string
  balances: Balances
}

// Mock balances for demo purposes - in production, these would come from blockchain queries
const defaultBalances: Balances = { WLD: 12.34, ETH: 0.56, "USDC.e": 150 }

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    username: undefined,
    balances: defaultBalances,
  })

  useEffect(() => {
    // Check if MiniKit is installed and available
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      // Check if user is already authenticated
      const user = MiniKit.user
      if (user?.username) {
        setWalletState(prev => ({
          ...prev,
          connected: true,
          username: user.username,
        }))
      }
    }
  }, [])

  async function connect() {
    if (!MiniKit.isInstalled()) {
      console.warn("MiniKit is not installed")
      return
    }

    try {
      // Use Wallet Auth (Sign in with Ethereum) for authentication
      const nonce = Math.random().toString(36).substring(2, 15)
      const requestId = Math.random().toString(36).substring(2, 15)
      
      const walletAuthResult = await MiniKit.commands.walletAuth({
        nonce,
        requestId,
        expirationTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        notBefore: new Date(),
        statement: "Sign in to InstaINR to access your wallet and trade tokens.",
      })

      if (walletAuthResult) {
        // After successful wallet auth, user info should be available
        const user = MiniKit.user
        setWalletState(prev => ({
          ...prev,
          connected: true,
          username: user?.username || "World App User",
        }))
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      // Fallback to mock connection for development
      setWalletState(prev => ({
        ...prev,
        connected: true,
        username: "pikai.1111",
      }))
    }
  }

  function disconnect() {
    setWalletState(prev => ({
      ...prev,
      connected: false,
      username: undefined,
    }))
  }

  function deductBalance(sym: keyof Balances, amount: number) {
    setWalletState(prev => ({
      ...prev,
      balances: {
        ...prev.balances,
        [sym]: Math.max(0, Number((prev.balances[sym] - amount).toFixed(6))),
      },
    }))
  }

  return {
    connected: walletState.connected,
    username: walletState.username,
    balances: walletState.balances,
    connect,
    disconnect,
    deductBalance,
  }
}
