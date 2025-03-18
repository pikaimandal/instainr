"use client"

import { useState, useEffect } from "react"
import SplashScreen from "../components/splash-screen"
import Header from "../components/header"
import Navigation from "../components/navigation"
import BalanceCard from "../components/balance-card"
import ConversionCard from "../components/conversion-card"
import TransactionHistory from "../components/transaction-history"
import ProfileScreen from "../components/profile-screen"
import KYCScreen from "../components/kyc-screen"
import AuthScreen from "../components/auth-screen"
import Notification from "../components/notification"

export default function Home() {
  const [activeScreen, setActiveScreen] = useState("home-screen")
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<{
    name: string;
    worldId: string;
    email: string;
    phone: string;
  } | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)
  const [kycComplete, setKycComplete] = useState(false)

  // Check for URL query parameters (for redirects from dashboard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const screenParam = urlParams.get('screen');
      
      if (screenParam && ['home-screen', 'history-screen', 'profile-screen', 'kyc-screen'].includes(screenParam)) {
        setActiveScreen(screenParam);
        
        // Clean up the URL by removing the query parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  // Mock data
  const balances = [
    { coin: "WLD", icon: "/images/wldtoken.png", value: 12.453 },
    { coin: "ETH", icon: "/images/ethtoken.png", value: 0.125 },
    { coin: "USDT", icon: "/images/usdttoken.png", value: 245.0 },
  ]

  const transactions = [
    {
      id: "1",
      type: "WLD to INR",
      fromCurrency: "WLD",
      fromAmount: 2.5,
      toAmount: 1063.3,
      date: "March 17, 2025",
      time: "14:32",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "ETH to INR",
      fromCurrency: "ETH",
      fromAmount: 0.05,
      toAmount: 9256.45,
      date: "March 17, 2025",
      time: "10:15",
      status: "pending" as const,
      timeRemaining: 32,
    },
    {
      id: "3",
      type: "USDT to INR",
      fromCurrency: "USDT",
      fromAmount: 100,
      toAmount: 8325.0,
      date: "March 15, 2025",
      time: "09:47",
      status: "completed" as const,
    },
  ]

  const bankAccount = {
    bankName: "State Bank of India",
    accountNumber: "XXXX XXXX 5678",
    accountName: "John Doe",
  }

  const documents = {
    idVerified: kycComplete,
    addressVerified: kycComplete,
  }

  // Check for existing user on mount (would use Supabase in real app)
  useEffect(() => {
    // Simulate checking for existing user
    const checkUser = async () => {
      // In a real app, this would be a Supabase query
      const storedUser = localStorage.getItem("instaInrUser")
      
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      
      // Hide splash screen after checking
      setTimeout(() => {
        setShowSplash(false)
      }, 2000)
    }
    
    checkUser()
  }, [])

  // Handle user authentication
  const handleAuthenticated = (userData: {
    name: string;
    worldId: string;
    email: string;
    phone: string;
  }) => {
    // In a real app, this would save to Supabase
    setUser(userData)
    localStorage.setItem("instaInrUser", JSON.stringify(userData))
    
    // Navigate to KYC screen
    setActiveScreen("kyc-screen")
    showNotification("Account created successfully!", "success")
  }

  // Handle KYC completion
  const handleKYCComplete = () => {
    setKycComplete(true)
    showNotification("KYC documents submitted successfully!", "success")
    setActiveScreen("profile-screen")
  }

  // Handle conversion completion
  const handleConversionComplete = () => {
    setActiveScreen("history-screen")
    showNotification("Conversion initiated successfully!", "success")
  }

  // Handle logout
  const handleLogout = () => {
    // In a real app, this would call Supabase auth.signOut()
    setUser(null)
    localStorage.removeItem("instaInrUser")
    showNotification("You have been logged out", "info")
    setActiveScreen("home-screen")
  }

  // Show notification
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // If splash screen is showing
  if (showSplash) {
    return <SplashScreen />
  }

  // If user is not authenticated
  if (!user) {
    return (
      <div className="h-screen">
        <AuthScreen onAuthenticated={handleAuthenticated} />
      </div>
    )
  }

  return (
    <>
      <Header userInitial={user.name.charAt(0)} />

      <main className="flex-1 p-5 pb-20 overflow-y-auto">
        {/* Home / Conversion Screen */}
        <section className={`${activeScreen === "home-screen" ? "block" : "hidden"}`}>
          <BalanceCard balances={balances} />
          <ConversionCard
            balances={balances.map((b) => ({ coin: b.coin, value: b.value }))}
            onConversionComplete={handleConversionComplete}
          />
        </section>

        {/* Transaction History Screen */}
        <section className={`${activeScreen === "history-screen" ? "block" : "hidden"}`}>
          <TransactionHistory transactions={transactions} />
        </section>

        {/* Profile Screen */}
        <section className={`${activeScreen === "profile-screen" ? "block" : "hidden"}`}>
          <ProfileScreen 
            user={user} 
            bankAccount={bankAccount} 
            documents={documents} 
            onLogout={handleLogout} 
          />
        </section>

        {/* KYC Screen */}
        <section className={`${activeScreen === "kyc-screen" ? "block" : "hidden"}`}>
          <KYCScreen
            onBack={() => setActiveScreen("profile-screen")}
            onContinue={handleKYCComplete}
          />
        </section>
      </main>

      <Navigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  )
}

