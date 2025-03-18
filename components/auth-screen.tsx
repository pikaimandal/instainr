"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { z } from "zod"
import type {} from "../lib/minikit" // Import types without importing any actual code
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { getUser, setUser } from "../lib/store"
import { useUserContext } from "../app/user-provider"
import { useRouter } from "next/navigation"
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit"
import { verifyWorldId, mockSiweVerify } from "../lib/actions"
import { useMiniKitPolling, detectWorldApp } from "../lib/minikit"

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
  const { toast } = useToast()
  const { user, setUser: setContextUser } = useUserContext()
  const router = useRouter()
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
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  useEffect(() => {
    // Capture debug info to help troubleshoot
    const captureDebugInfo = () => {
      const info: Record<string, any> = {
        isInIframe: window !== window.parent,
        userAgent: navigator.userAgent,
        hasMiniKit: !!window.MiniKit,
        miniKitVersion: window.MiniKit && 'version' in window.MiniKit ? window.MiniKit.version : 'unknown',
        windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('world') || k.toLowerCase().includes('mini')),
        documentReady: document.readyState,
      };
      
      setDebugInfo(info);
      console.log("Debug info:", info);
    };

    // Try to detect World App using multiple methods
    const detectWorldApp = () => {
      const isInIframe = window !== window.parent;
      const userAgent = navigator.userAgent.toLowerCase();
      const isWorldAppUserAgent = userAgent.includes('world');
      const worldAppUrlIndicator = window.location.href.includes('worldapp');
      
      // Check for MiniKit.isInstalled() for the most reliable detection
      if (window.MiniKit && typeof window.MiniKit.isInstalled === 'function') {
        const isInstalled = window.MiniKit.isInstalled();
        console.log("MiniKit.isInstalled() returned:", isInstalled);
        
        // If MiniKit reports it's installed in World App, trust that
        if (isInstalled) {
          setMiniKitLoaded(true);
          setIsWorldAppEnvironment(true);
          return true;
        }
      }
      
      // Secondary detection methods (less reliable)
      if (isWorldAppUserAgent || isInIframe || worldAppUrlIndicator) {
        console.log("World App detected via secondary methods");
        return true;
      }
      
      return false;
    };
    
    const checkMiniKit = () => {
      captureDebugInfo();
      
      if (window.MiniKit) {
        console.log("MiniKit found on window");
        setMiniKitLoaded(true);
        
        // If detectWorldApp confirms we're in World App
        if (detectWorldApp()) {
          setIsWorldAppEnvironment(true);
          
          // Try to get user info if already authenticated
          if (window.MiniKit.walletAddress) {
            console.log("User already authenticated:", window.MiniKit.walletAddress);
            setWalletAddress(window.MiniKit.walletAddress);
            setUsername(window.MiniKit.user?.username || "");
            setWorldIdVerified(true);
            setStep("details");
          }
          return;
        }
      }
      
      // Set app as running outside World App after reasonable attempts
      if (window.WORLD_APP_CHECK_COUNT === undefined) {
        window.WORLD_APP_CHECK_COUNT = 0;
      }
      
      window.WORLD_APP_CHECK_COUNT++;
      
      // After 5 attempts (2.5 seconds), assume not in World App
      if (window.WORLD_APP_CHECK_COUNT > 5) {
        console.log("Not detected as World App environment after multiple attempts");
        setIsWorldAppEnvironment(false);
        return;
      }
      
      // Try again in 500ms
      setTimeout(checkMiniKit, 500);
    };
    
    // Initialize with app ID and start detection
    const initializeApp = async () => {
      const defaultAppId = "app_a694eef5223a11d38b4f737fad00e561";
      setAppId(window.WORLD_APP_ID || defaultAppId);
      
      try {
        // Fetch nonce which also provides app ID
        const response = await fetch('/api/nonce');
        if (response.ok) {
          const data = await response.json();
          if (data.appId) {
            setAppId(data.appId);
          }
        }
      } catch (error) {
        console.error("Failed to get app credentials:", error);
      }
      
      // Start detection process
      checkMiniKit();
    };
    
    initializeApp();
    
    // If document not yet loaded, try again when it is
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        console.log("Window loaded, checking MiniKit again");
        checkMiniKit();
      });
    }
  }, []);

  // Handle World ID authentication using wallet auth (more reliable in World App)
  const handleWorldIdAuth = async () => {
    if (isWorldAppEnvironment && !miniKitLoaded) {
      setErrorMessage("World App detected but MiniKit not loaded. Please try again or restart the app.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Get nonce from our backend
      const nonceResponse = await fetch('/api/nonce');
      if (!nonceResponse.ok) {
        throw new Error("Failed to get authentication nonce");
      }
      
      const { nonce } = await nonceResponse.json();
      console.log("Got nonce:", nonce);
      
      if (isWorldAppEnvironment) {
        console.log("Authenticating in World App environment...");
        
        // Preferred method: wallet auth for World App (more reliable)
        console.log("Using walletAuth command...");
        
        if (!window.MiniKit.commandsAsync?.walletAuth) {
          throw new Error("walletAuth method not available on MiniKit");
        }
        
        const { finalPayload } = await window.MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          statement: "Sign in to InstaINR to convert your crypto to INR",
        });
        
        console.log("WalletAuth response:", finalPayload);
        
        if (finalPayload.status === 'error') {
          throw new Error(finalPayload.message || "Authentication failed");
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
        });
        
        if (!verifyResponse.ok) {
          throw new Error("Failed to verify authentication");
        }
        
        const verifyResult = await verifyResponse.json();
        console.log("Backend verification result:", verifyResult);
        
        if (!verifyResult.isValid) {
          throw new Error("Invalid authentication signature");
        }
        
        // Set user data from World App
        setWalletAddress(finalPayload.address || "");
        setUsername(window.MiniKit.user?.username || "");
        setWorldIdVerified(true);
      } else {
        console.log("Using demo authentication for web environment");
        // For web (non-World App environment), use a demo wallet address
        setWalletAddress("0xDemoWallet123...789");
        setUsername("DemoUser");
        setWorldIdVerified(true);
      }
      
      // Move to details step
      setStep("details");
    } catch (error: any) {
      console.error("Authentication error:", error);
      setErrorMessage(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Enhanced World App detection
  const detectWorldAppEnv = async () => {
    const isWorldApp = await detectWorldApp()
    setIsWorldAppEnvironment(isWorldApp)
    return isWorldApp
  }

  // Function to check and initialize MiniKit
  const checkMiniKit = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      
      // Detect World App environment
      const isWorldApp = await detectWorldAppEnv()
      
      // Define captureDebugInfo function
      const captureDebugInfo = () => {
        const info: Record<string, any> = {
          isInIframe: typeof window !== 'undefined' ? window !== window.parent : 'SSR',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
          hasMiniKit: typeof window !== 'undefined' ? !!window.MiniKit : 'SSR',
          miniKitVersion: typeof window !== 'undefined' && window.MiniKit && 'version' in window.MiniKit ? window.MiniKit.version : 'unknown',
          windowKeys: typeof window !== 'undefined' ? Object.keys(window).filter(k => k.toLowerCase().includes('world') || k.toLowerCase().includes('mini')) : [],
          documentReady: typeof document !== 'undefined' ? document.readyState : 'SSR',
        };
        
        setDebugInfo(info);
        console.log("Debug info:", info);
        return info;
      };
      
      // Capture debug info
      const debugData = captureDebugInfo()
      console.log("Debug info:", debugData)
      
      if (isWorldApp) {
        console.log("We are in World App, using wallet auth")
        // In World App environment, use wallet auth
        await handleWorldIdAuth()
      } else {
        console.log("Not in World App, showing World ID widget")
        // Show World ID widget for non-World App environments
        // This is handled by the IDKitWidget component in the UI
      }
    } catch (error) {
      console.error("MiniKit check failed:", error)
      setErrorMessage(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Define captureDebugInfo function at component level
  const captureDebugInfo = () => {
    const info: Record<string, any> = {
      isInIframe: typeof window !== 'undefined' ? window !== window.parent : 'SSR',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      hasMiniKit: typeof window !== 'undefined' ? !!window.MiniKit : 'SSR',
      miniKitVersion: typeof window !== 'undefined' && window.MiniKit && 'version' in window.MiniKit ? window.MiniKit.version : 'unknown',
      windowKeys: typeof window !== 'undefined' ? Object.keys(window).filter(k => k.toLowerCase().includes('world') || k.toLowerCase().includes('mini')) : [],
      documentReady: typeof document !== 'undefined' ? document.readyState : 'SSR',
    };
    
    setDebugInfo(info);
    console.log("Debug info:", info);
    return info;
  };

  // Use MiniKit polling to wait for MiniKit to be available
  useMiniKitPolling(() => {
    console.log("MiniKit polling callback triggered")
    detectWorldAppEnv()
    captureDebugInfo()
  })

  useEffect(() => {
    // First run detection on component mount
    detectWorldAppEnv()
    captureDebugInfo()
  }, [])

  // Handle successful verification from IDKitWidget
  const handleVerify = async (proof: any) => {
    try {
      setIsLoading(true)
      
      // Verify the proof with our backend
      const response = await verifyWorldId(
        proof.merkle_root,
        proof.nullifier_hash,
        proof.proof,
        VerificationLevel.Device
      )
      
      if (response.success) {
        // Create a new user with the nullifier hash as ID
        const newUser = {
          id: proof.nullifier_hash,
          nullifierHash: proof.nullifier_hash,
          // Add other user properties as needed
        }
        
        setUser(newUser)
        setContextUser(newUser)
        router.push("/dashboard")
        
        toast({
          title: "Verification successful",
          description: "You are now logged in with World ID",
        })
      } else {
        throw new Error(response.error || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Failed to verify",
      })
    } finally {
      setIsLoading(false)
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
            onClick={checkMiniKit}
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
            {Object.keys(debugInfo).length > 0 && (
              <div className="text-left mt-4 border-t pt-4 border-border">
                <p className="font-medium mb-1">Debug Info:</p>
                <p>In iframe: {debugInfo.isInIframe ? "Yes" : "No"}</p>
                <p>MiniKit present: {debugInfo.hasMiniKit ? "Yes" : "No"}</p>
                <p>MiniKit version: {debugInfo.miniKitVersion}</p>
                <p className="mt-1 text-[10px] break-all">User agent: {debugInfo.userAgent}</p>
              </div>
            )}
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