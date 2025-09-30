"use client"

import { ReactNode, useEffect, createContext, useContext, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

interface MiniKitContextType {
  isInitialized: boolean
  isInstalled: boolean
}

const MiniKitContext = createContext<MiniKitContextType>({
  isInitialized: false,
  isInstalled: false,
})

export const useMiniKit = () => useContext(MiniKitContext)

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const initializeMiniKit = async () => {
      try {
        // Install MiniKit with proper app ID
        await MiniKit.install(process.env.NEXT_PUBLIC_WLD_APP_ID!)
        
        // Check if MiniKit is properly installed
        const installed = MiniKit.isInstalled()
        setIsInstalled(installed)
        setIsInitialized(true)
        
        console.log("MiniKit initialized:", { installed })
      } catch (error) {
        console.error("Failed to initialize MiniKit:", error)
        setIsInitialized(true) // Still mark as initialized to prevent infinite loading
      }
    }

    initializeMiniKit()
  }, [])

  const contextValue: MiniKitContextType = {
    isInitialized,
    isInstalled,
  }

  return (
    <MiniKitContext.Provider value={contextValue}>
      {children}
    </MiniKitContext.Provider>
  )
}