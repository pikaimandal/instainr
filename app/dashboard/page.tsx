"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserContext } from "../user-provider"
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading } = useUserContext()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Redirect to home if not authenticated after loading
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Don't render anything on the server to avoid hydration errors
  if (!isClient) {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  // Show dashboard content if user is logged in
  if (user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="mb-4">
            <p className="text-text-secondary">Welcome to InstaINR!</p>
          </div>
          
          <div className="bg-[#F0F0F8] rounded-lg p-4 mb-6">
            <h2 className="font-bold mb-2">Your Account</h2>
            <p className="text-sm mb-1">
              <span className="font-medium">ID: </span>
              <span className="font-mono">{user.id.slice(0, 8)}...{user.id.slice(-6)}</span>
            </p>
            {user.address && (
              <p className="text-sm mb-1">
                <span className="font-medium">Wallet: </span>
                <span className="font-mono">{user.address.slice(0, 8)}...{user.address.slice(-6)}</span>
              </p>
            )}
            {user.name && (
              <p className="text-sm mb-1">
                <span className="font-medium">Name: </span>
                <span>{user.name}</span>
              </p>
            )}
            {user.email && (
              <p className="text-sm mb-1">
                <span className="font-medium">Email: </span>
                <span>{user.email}</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <button className="primary-button">
              Convert Crypto to INR
            </button>
            <Link href="/" className="text-center text-text-secondary text-sm">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fallback if neither loading nor user
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <p className="mb-4">You are not logged in</p>
        <Link href="/" className="primary-button inline-block">
          Go to Login Page
        </Link>
      </div>
    </div>
  )
} 