"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { fetchAllTokenBalances, isValidAddress } from "@/lib/blockchain"

type Balances = {
  WLD: number
  ETH: number
  "USDC.e": number
}

type WalletState = {
  connected: boolean
  username?: string
  balances: Balances
  isLoadingBalances: boolean
  balanceError?: string
}

// Default balances while loading or on error
const defaultBalances: Balances = { WLD: 0, ETH: 0, "USDC.e": 0 }

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
            isLoadingBalances: false,
            balanceError: undefined,
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
      isLoadingBalances: false,
      balanceError: undefined,
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

  // Function to fetch real token balances
  async function fetchBalances() {
    console.log('=== STARTING BALANCE FETCH ====')
    console.log('🔄 Starting balance fetch...')
    console.log('MiniKit installed:', MiniKit.isInstalled())
    console.log('Wallet connected:', walletState.connected)
    
    if (!walletState.connected || !MiniKit.isInstalled()) {
      console.log('❌ Skipping: not connected or MiniKit not installed')
      return
    }

    try {
      // Get wallet address directly from MiniKit after authentication
      const walletAddress = (MiniKit as any).walletAddress
      console.log('💰 MiniKit.walletAddress:', walletAddress)
      
      if (!walletAddress) {
        console.error('❌ No wallet address from MiniKit.walletAddress')
        throw new Error('No wallet address available from MiniKit')
      }
      
      if (!isValidAddress(walletAddress)) {
        console.error('❌ Invalid address format:', walletAddress)
        throw new Error(`Invalid wallet address: ${walletAddress}`)
      }
      
      console.log('✅ Using wallet address:', walletAddress)

      console.log('🔄 Setting loading state to true')
      setWalletState(prev => ({
        ...prev,
        isLoadingBalances: true,
        balanceError: undefined,
      }))

      console.log('🌐 Calling fetchAllTokenBalances with address:', walletAddress)
      const balanceStrings = await fetchAllTokenBalances(walletAddress)
      console.log('✅ Received balance strings from blockchain:', balanceStrings)
      
      // Convert string balances to numbers
      const balances: Balances = {
        WLD: parseFloat(balanceStrings.WLD),
        ETH: parseFloat(balanceStrings.ETH),
        "USDC.e": parseFloat(balanceStrings["USDC.e"]),
      }

      console.log('✅ Converted balances to numbers:', balances)
      console.log('🎉 Balance fetch completed successfully!')

      setWalletState(prev => ({
        ...prev,
        balances,
        isLoadingBalances: false,
        balanceError: undefined,
      }))
    } catch (error) {
      console.error('❌ BALANCE FETCH ERROR:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error constructor:', error?.constructor?.name)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balances'
      console.error('❌ Final error message:', errorMessage)
      
      // Log the full error stack if available
      if (error instanceof Error && error.stack) {
        console.error('❌ Error stack:', error.stack)
      }
      
      console.log('🔄 Setting error state and stopping loading')
      setWalletState(prev => ({
        ...prev,
        isLoadingBalances: false,
        balanceError: errorMessage,
      }))
      
      console.log('=== BALANCE FETCH FAILED ====')
    }
  }

  useEffect(() => {
    // Check if MiniKit is installed and user is already authenticated
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      const user = MiniKit.user
      if (user?.username && !walletState.connected) {
        console.log('🔍 Auto-connecting existing user:', user.username)
        
        setWalletState(prev => ({
          ...prev,
          connected: true,
          username: user.username,
        }))
        
        // Fetch balances after auto-connection
        console.log('✅ Auto-connected, fetching balances...')
        setTimeout(() => fetchBalances(), 500)
      }
    }
  }, [])

  // Auto-refresh balances periodically when connected
  useEffect(() => {
    if (!walletState.connected) return

    // Initial balance fetch (if not already loading)
    if (!walletState.isLoadingBalances && walletState.balances.WLD === 0 && walletState.balances.ETH === 0 && walletState.balances["USDC.e"] === 0) {
      fetchBalances()
    }

    // Set up periodic balance refresh (every 30 seconds)
    const interval = setInterval(() => {
      if (!walletState.isLoadingBalances) {
        fetchBalances()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [walletState.connected])

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

      console.log('🔐 Wallet auth successful')

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
      
      console.log('✅ Wallet authentication verified successfully')

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
        console.log('👤 Connected! Username:', user.username)
        setWalletState(prev => ({
          ...prev,
          connected: true,
          username: user.username,
        }))
        
        // Fetch real balances after successful connection
        // Use setTimeout to ensure state is updated first
        setTimeout(() => fetchBalances(), 100)
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
      isLoadingBalances: false,
      balanceError: undefined,
    })
    
    // Clear localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.removeItem('instainr-wallet-state')
    }
    
    // Clear any potential MiniKit cached data
    if (MiniKit.isInstalled()) {
      // Force clear any cached user data by trying to access it
      try {
        // Access MiniKit.user to ensure it's reset
        const user = MiniKit.user
        console.log("User disconnected from InstaINR, cleared session")
      } catch (e) {
        console.log("MiniKit user data cleared")
      }
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
    isLoadingBalances: walletState.isLoadingBalances,
    balanceError: walletState.balanceError,
    connect,
    disconnect,
    deductBalance,
    refreshBalances: fetchBalances,
  }
}
