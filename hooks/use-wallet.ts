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
    // Check if MiniKit is installed and user is already authenticated
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
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
      throw new Error("MiniKit is not available. Please open this app in World App.")
    }

    try {
      // Generate secure nonce and request ID
      const nonce = crypto.getRandomValues(new Uint8Array(16))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
        .substring(0, 16)
      
      const requestId = crypto.getRandomValues(new Uint8Array(16))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
        .substring(0, 16)
      
      // Use Wallet Auth (Sign in with Ethereum) for authentication
      const walletAuthResult = await MiniKit.commands.walletAuth({
        nonce,
        requestId,
        expirationTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        notBefore: new Date(),
        statement: "Sign in to InstaINR to access your wallet and trade tokens.",
      })

      if (walletAuthResult) {
        // After successful wallet auth, get user info from MiniKit
        const user = MiniKit.user
        if (user?.username) {
          setWalletState(prev => ({
            ...prev,
            connected: true,
            username: user.username,
          }))
        } else {
          throw new Error("Failed to retrieve user information after authentication")
        }
      } else {
        throw new Error("Wallet authentication failed")
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error // Re-throw for proper error handling in UI
    }
  }

  function disconnect() {
    // Clear wallet state immediately
    setWalletState({
      connected: false,
      username: undefined,
      balances: defaultBalances,
    })
    
    // Clear any MiniKit session data if available
    if (MiniKit.isInstalled()) {
      // MiniKit doesn't have a direct logout method, but we clear our local state
      console.log("User disconnected from InstaINR")
    }
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
