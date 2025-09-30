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
  const [walletState, setWalletState] = useState<WalletState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem('instainr-wallet-state')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return {
            ...parsed,
            balances: defaultBalances, // Always use fresh balances
          }
        } catch (e) {
          console.error('Failed to parse stored wallet state:', e)
        }
      }
    }
    return {
      connected: false,
      username: undefined,
      balances: defaultBalances,
    }
  })

  // Persist wallet state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('instainr-wallet-state', JSON.stringify({
        connected: walletState.connected,
        username: walletState.username,
      }))
    }
  }, [walletState.connected, walletState.username])

  useEffect(() => {
    // Check if MiniKit is installed and user is already authenticated
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      const user = MiniKit.user
      if (user?.username && !walletState.connected) {
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
      // Get nonce from backend as per documentation
      const res = await fetch('/api/nonce')
      const { nonce } = await res.json()

      // Use async wallet auth command as documented
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0', // Optional
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to InstaINR to access your wallet and trade tokens.',
      })

      if (finalPayload.status === 'error') {
        throw new Error('Wallet authentication was rejected or failed')
      }

      // Verify the SIWE message in backend
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const verificationResult = await response.json()
      
      if (verificationResult.status === 'error' || !verificationResult.isValid) {
        throw new Error('Failed to verify wallet authentication')
      }

      // Now get user info from MiniKit after successful authentication
      // Sometimes the user info takes a moment to be available after authentication
      let attempts = 0
      let user = MiniKit.user
      
      while (!user?.username && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100)) // Wait 100ms
        user = MiniKit.user
        attempts++
      }
      
      if (user?.username) {
        setWalletState(prev => ({
          ...prev,
          connected: true,
          username: user.username,
        }))
      } else {
        throw new Error("Failed to retrieve user information after authentication")
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
    
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem('instainr-wallet-state')
    }
    
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
