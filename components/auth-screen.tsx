"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { z } from "zod"
import type {} from "@/lib/minikit" // Import types without importing any actual code

interface AuthScreenProps {
  onAuthenticated: (userData: {
    name: string;
    worldId: string;
    email: string;
    phone: string;
  }) => void;
}

// Form validation schema
const userSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, "Please enter a valid Indian mobile number"),
})

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [step, setStep] = useState<"auth" | "details">("auth")
  const [worldIdVerified, setWorldIdVerified] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [username, setUsername] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [miniKitLoaded, setMiniKitLoaded] = useState(false)
  const [appId, setAppId] = useState<string | null>(null)
  const [isWorldAppEnvironment, setIsWorldAppEnvironment] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  console.log("Component mounted, checking environment...")

  // Check if MiniKit is available and initialize
  useEffect(() => {
    // Simple check: if running in an iframe, likely in World App
    const isInIframe = window !== window.parent
    console.log("Is in iframe:", isInIframe)

    const checkMiniKit = () => {
      if (typeof window !== "undefined") {
        // Log what window.MiniKit contains
        console.log("MiniKit check:", window.MiniKit ? "found" : "not found", window.MiniKit)
        
        // Direct check if MiniKit reports it's in World App
        if (window.MiniKit?.isInWorldApp) {
          console.log("MiniKit.isInWorldApp reports true")
          setIsWorldAppEnvironment(true)
          setMiniKitLoaded(true)
          return
        }
        
        // Check if MiniKit exists and can be used
        if (window.MiniKit && typeof window.MiniKit.isInstalled === 'function') {
          const isInstalled = window.MiniKit.isInstalled()
          console.log("MiniKit.isInstalled() returned:", isInstalled)
          
          if (isInstalled) {
            setMiniKitLoaded(true)
            setIsWorldAppEnvironment(true)
            
            // If user is already authenticated in World App, we can get their username
            if (window.MiniKit.user?.username) {
              setUsername(window.MiniKit.user.username || "")
            }
            
            // If user is already authenticated with wallet, we can get their address
            if (window.MiniKit.walletAddress) {
              setWalletAddress(window.MiniKit.walletAddress || "")
              setWorldIdVerified(true)
              setStep("details")
            }
            return
          }
        }
        
        // More reliable detection: use the user agent
        const userAgent = navigator.userAgent.toLowerCase()
        if (
          userAgent.includes('world') || 
          isInIframe || 
          window.location.href.includes('worldapp.co')
        ) {
          console.log("Detected World App via user agent or iframe")
          setIsWorldAppEnvironment(true)
          
          // Still waiting for MiniKit to initialize
          if (window.WORLD_APP_CHECK_COUNT === undefined) {
            window.WORLD_APP_CHECK_COUNT = 0
          } else if (window.WORLD_APP_CHECK_COUNT > 10) { // 5 seconds max
            setErrorMessage("MiniKit failed to initialize in World App")
            return
          }
          
          window.WORLD_APP_CHECK_COUNT++
          setTimeout(checkMiniKit, 500)
          return
        }

        // After 2 seconds of trying, assume we're not in World App
        if (window.WORLD_APP_CHECK_COUNT === undefined) {
          window.WORLD_APP_CHECK_COUNT = 0
        }
        
        window.WORLD_APP_CHECK_COUNT++
        
        if (window.WORLD_APP_CHECK_COUNT > 4) { // Tried 5 times (2.5 seconds)
          console.log("Not in World App environment after multiple checks")
          setIsWorldAppEnvironment(false)
          return
        }
        
        // Check again in 500ms if not loaded yet
        setTimeout(checkMiniKit, 500)
      }
    }
    
    // Initialize MiniKit with app ID
    const initMiniKit = async () => {
      try {
        // In World App or regular web environment, get app ID
        const defaultAppId = "app_a694eef5223a11d38b4f737fad00e561"
        setAppId(window.WORLD_APP_ID || defaultAppId)
        console.log("AppID set to:", window.WORLD_APP_ID || defaultAppId)
        
        // For regular web, also fetch from API
        const response = await fetch('/api/nonce')
        if (response.ok) {
          const data = await response.json()
          if (data.appId) {
            setAppId(data.appId)
            console.log("AppID from API:", data.appId)
          }
        }
      } catch (error) {
        console.error("Failed to get app credentials:", error)
      }
    }
    
    initMiniKit()
    checkMiniKit()
  }, [])

  // Handle World ID authentication using MiniKit Wallet Auth
  const handleWorldIdAuth = async () => {
    if (isWorldAppEnvironment && (!miniKitLoaded || !appId)) {
      console.error("MiniKit not loaded or missing app ID")
      setErrorMessage("MiniKit not loaded or missing app ID. Please try again.")
      return
    }
    
    setIsLoading(true)
    setErrorMessage(null)
    
    try {
      // Get nonce from our backend
      const nonceResponse = await fetch('/api/nonce')
      if (!nonceResponse.ok) {
        throw new Error("Failed to get authentication nonce")
      }
      
      const { nonce } = await nonceResponse.json()
      console.log("Got nonce:", nonce)
      
      if (isWorldAppEnvironment) {
        console.log("Authenticating in World App environment...")
        
        // First try the verify command (preferred for World ID verification)
        try {
          if (window.MiniKit.commandsAsync.verify) {
            console.log("Using verify command...")
            const { commandPayload, finalPayload } = await window.MiniKit.commandsAsync.verify({
              action: "auth",
              signal: nonce
            })
            
            if (finalPayload.status === 'success') {
              console.log("Verify successful:", finalPayload)
              // Set a demo wallet address since we verified with World ID directly
              setWalletAddress("world_id_verified_" + finalPayload.nullifier_hash?.substring(0, 10))
              setUsername(window.MiniKit.user?.username || "WorldApp User")
              setWorldIdVerified(true)
              setStep("details")
              setIsLoading(false)
              return
            }
          }
        } catch (verifyError) {
          console.error("Verify failed, falling back to walletAuth:", verifyError)
        }
        
        // Fall back to wallet auth if verify isn't available
        console.log("Using walletAuth command...")
        const { commandPayload, finalPayload } = await window.MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          statement: "Sign in to InstaINR to convert your crypto to INR",
          requestId: appId!, // Using appId as requestId for tracking
        })
        
        console.log("WalletAuth response:", finalPayload)
        
        if (finalPayload.status === 'error') {
          throw new Error(finalPayload.message || "Authentication failed")
        }
        
        // Verify the signature on our backend
        const verifyResponse = await fetch('/api/complete-siwe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: finalPayload,
            nonce,
            appId,
          }),
        })
        
        if (!verifyResponse.ok) {
          throw new Error("Failed to verify authentication")
        }
        
        const verifyResult = await verifyResponse.json()
        console.log("Backend verification result:", verifyResult)
        
        if (!verifyResult.isValid) {
          throw new Error("Invalid authentication signature")
        }
        
        // Set user data from World App
        setWalletAddress(finalPayload.address || "")
        setUsername(window.MiniKit.user?.username || "")
        setWorldIdVerified(true)
      } else {
        console.log("Using demo authentication for web environment")
        // For web (non-World App environment), use a demo wallet address
        setWalletAddress("0xDemoWallet123...789")
        setUsername("DemoUser")
        setWorldIdVerified(true)
      }
      
      // Move to details step
      setStep("details")
    } catch (error: any) {
      console.error("Authentication error:", error)
      setErrorMessage(error.message || "Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate form data
      userSchema.parse(formData)
      
      // If validation passes, proceed with account creation
      setIsLoading(true)
      
      // In production, this would call our backend API to create the user
      // with the wallet address and additional info
      setTimeout(() => {
        onAuthenticated({
          ...formData,
          worldId: walletAddress,
        })
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to our errors state
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      {step === "auth" ? (
        <div className="bg-card rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-8">
            <Image src="/images/Instainrlogo.png" alt="InstaINR Logo" width={64} height={64} className="mb-4" />
            <h1 className="text-2xl font-bold">Welcome to InstaINR</h1>
            <p className="text-text-secondary mt-2">
              Convert your crypto to INR instantly
            </p>
          </div>
          
          <div className="bg-[#F0F0F8] rounded-lg p-4 mb-6">
            <p className="text-sm text-text-secondary">
              {isWorldAppEnvironment 
                ? "InstaINR uses World ID to verify your identity. Authenticate with your World App wallet to continue."
                : "Authenticate to continue using InstaINR. Since you're not using World App, you'll get a demo account."}
            </p>
          </div>
          
          {errorMessage && (
            <div className="bg-red-100 text-red-600 rounded-lg p-4 mb-6">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <button
            className="primary-button w-full flex items-center justify-center gap-2"
            onClick={handleWorldIdAuth}
            disabled={isLoading || (isWorldAppEnvironment === true && !miniKitLoaded) || isWorldAppEnvironment === null}
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : isWorldAppEnvironment === null ? (
              <span className="animate-pulse">Checking environment...</span>
            ) : isWorldAppEnvironment && !miniKitLoaded ? (
              <span>Loading World App...</span>
            ) : (
              <>
                <Image src="/images/worldcoin-logo.png" alt="World ID" width={24} height={24} />
                <span>{isWorldAppEnvironment ? "Authenticate with World App" : "Demo Authentication"}</span>
              </>
            )}
          </button>
          
          <div className="mt-6 text-center text-xs text-text-tertiary">
            <p>Environment: {isWorldAppEnvironment === null ? "Detecting..." : isWorldAppEnvironment ? "World App" : "Web Browser"}</p>
            <p>MiniKit: {miniKitLoaded ? "Loaded" : "Not Loaded"}</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full max-w-md">
          <div className="flex items-center mb-6">
            <button onClick={() => setStep("auth")} className="mr-3">
              <i className="fas fa-arrow-left text-text-secondary"></i>
            </button>
            <h2 className="text-xl font-semibold">Create Account</h2>
          </div>
          
          <div className="bg-success/10 text-success rounded-lg p-4 mb-6 flex items-start">
            <i className="fas fa-check-circle mt-1 mr-2"></i>
            <div>
              <p className="font-medium">{isWorldAppEnvironment ? "World App Authenticated" : "Demo Authentication"}</p>
              <p className="text-sm">{walletAddress}</p>
              {username && <p className="text-sm mt-1">Username: {username}</p>}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm text-text-tertiary block mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`h-12 px-4 border ${errors.name ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-text-tertiary block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`h-12 px-4 border ${errors.email ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-6">
              <label className="text-sm text-text-tertiary block mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`h-12 px-4 border ${errors.phone ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <button
              type="submit"
              className="primary-button w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Continue to KYC"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}