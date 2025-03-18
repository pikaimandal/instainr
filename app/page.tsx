"use client"

import { useState } from "react"
import SplashScreen from "@/components/splash-screen"
import Header from "@/components/header"
import Navigation from "@/components/navigation"
import BalanceCard from "@/components/balance-card"
import ConversionCard from "@/components/conversion-card"
import TransactionHistory from "@/components/transaction-history"
import ProfileScreen from "@/components/profile-screen"
import KYCScreen from "@/components/kyc-screen"
import Notification from "@/components/notification"

export default function Home() {
  const [activeScreen, setActiveScreen] = useState("home-screen")
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)

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

  const user = {
    name: "John Doe",
    worldId: "0x71C...8F3E",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
  }

  const bankAccount = {
    bankName: "State Bank of India",
    accountNumber: "XXXX XXXX 5678",
    accountName: "John Doe",
  }

  const documents = [
    {
      type: "Aadhaar Card",
      number: "XXXX XXXX 1234",
      verified: true,
    },
    {
      type: "PAN Card",
      number: "ABCDE1234F",
      verified: true,
    },
  ]

  const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type })
  }

  const handleProfileClick = () => {
    setActiveScreen("profile-screen")
  }

  const handleConversionComplete = () => {
    showNotification("Conversion initiated successfully!", "success")
    setActiveScreen("history-screen")
  }

  const handleLogout = () => {
    showNotification("Logged out successfully", "info")
    // In a real app, you would handle logout logic here
  }

  return (
    <>
      <SplashScreen />

      <Header onProfileClick={handleProfileClick} />

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
          <ProfileScreen user={user} bankAccount={bankAccount} documents={documents} onLogout={handleLogout} />
        </section>

        {/* KYC Screen */}
        <section className={`${activeScreen === "kyc-screen" ? "block" : "hidden"}`}>
          <KYCScreen
            onBack={() => setActiveScreen("profile-screen")}
            onContinue={() => {
              showNotification("KYC documents submitted successfully!", "success")
              setActiveScreen("profile-screen")
            }}
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

