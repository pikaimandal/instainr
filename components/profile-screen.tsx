"use client"

import { useState } from "react"
import Image from "next/image"

interface ProfileScreenProps {
  user: {
    name: string
    worldId: string
    email: string
    phone: string
  } | null
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  } | null
  documents: {
    idVerified: boolean
    addressVerified: boolean
  }
  onLogout: () => void
}

export default function ProfileScreen({ user, bankAccount, documents, onLogout }: ProfileScreenProps) {
  const [copied, setCopied] = useState(false)

  const copyWorldId = () => {
    navigator.clipboard.writeText(user?.worldId || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex flex-col items-center py-5 border-b border-border mb-5">
        <Image src="/images/user.jpeg" alt="Profile" width={80} height={80} className="rounded-full mb-4" />
        <h2 className="text-xl font-semibold mb-2">{user?.name || ""}</h2>
        <div className="flex items-center bg-[#F0F0F8] px-3 py-2 rounded-lg text-sm">
          <span>WorldID: </span>
          <span className="mx-2 font-medium">{user?.worldId || ""}</span>
          <button
            onClick={copyWorldId}
            className="bg-transparent border-none text-primary cursor-pointer flex items-center justify-center p-1"
          >
            <i className="fas fa-copy"></i>
          </button>
        </div>
        {copied && <div className="text-xs text-success mt-2">Copied to clipboard!</div>}
      </div>

      <div className="mb-6">
        <h3 className="text-base font-semibold mb-4">Account Details</h3>
        <div className="flex justify-between py-3 border-b border-border">
          <div className="text-text-tertiary">Email</div>
          <div className="font-medium">{user?.email || ""}</div>
        </div>
        <div className="flex justify-between py-3">
          <div className="text-text-tertiary">Phone</div>
          <div className="font-medium">{user?.phone || ""}</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-semibold mb-4">Bank Details</h3>
        <div className="flex items-center bg-white rounded-xl p-4 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="mr-4">
            <Image src="/images/bank.jpg" alt="Bank Logo" width={40} height={40} className="rounded-lg" />
          </div>
          <div className="flex-1">
            <div className="font-semibold mb-1">{bankAccount?.bankName || ""}</div>
            <div className="text-sm text-text-secondary">{bankAccount?.accountNumber || ""}</div>
            <div className="text-sm text-text-secondary">{bankAccount?.accountName || ""}</div>
          </div>
          <div>
            <button className="w-8 h-8 bg-white border border-border rounded-full flex items-center justify-center text-text-tertiary cursor-pointer">
              <i className="fas fa-pen"></i>
            </button>
          </div>
        </div>
        <button className="secondary-button w-full">Add New Bank Account</button>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-semibold mb-4">KYC Documents</h3>
        <div className="flex items-center bg-success/10 text-success rounded-lg p-3 mb-4">
          <i className="fas fa-check-circle mr-2"></i>
          <span>Verification Complete</span>
        </div>

        <div className="flex flex-col gap-3">
          {documents.idVerified && (
            <div className="flex items-center bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 bg-[#F0F0F8] rounded-lg flex items-center justify-center mr-3 text-text-tertiary">
                <i className="fas fa-id-card"></i>
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Aadhaar Card</div>
                <div className="text-sm text-text-secondary">Verified</div>
              </div>
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white">
                <i className="fas fa-check"></i>
              </div>
            </div>
          )}
          {documents.addressVerified && (
            <div className="flex items-center bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 bg-[#F0F0F8] rounded-lg flex items-center justify-center mr-3 text-text-tertiary">
                <i className="fas fa-home"></i>
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Address Verification</div>
                <div className="text-sm text-text-secondary">Verified</div>
              </div>
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white">
                <i className="fas fa-check"></i>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          className="w-full py-3 mt-6 rounded-lg border border-red-500 text-red-500 font-medium"
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

