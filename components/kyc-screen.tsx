"use client"

import { useState } from "react"
import Image from "next/image"

interface KYCScreenProps {
  onBack: () => void
  onContinue: () => void
}

export default function KYCScreen({ onBack, onContinue }: KYCScreenProps) {
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null)
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null)
  const [panFile, setPanFile] = useState<File | null>(null)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [ifscCode, setIfscCode] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Handle file changes
  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieFile(e.target.files[0])
      // Clear error for this field
      setErrors(prev => ({ ...prev, selfie: false }))
    }
  }

  const handleAadharFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAadharFrontFile(e.target.files[0])
      // Clear error for this field
      setErrors(prev => ({ ...prev, aadharFront: false }))
    }
  }

  const handleAadharBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAadharBackFile(e.target.files[0])
      // Clear error for this field
      setErrors(prev => ({ ...prev, aadharBack: false }))
    }
  }

  const handlePanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPanFile(e.target.files[0])
      // Clear error for this field
      setErrors(prev => ({ ...prev, pan: false }))
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all files are present
    const newErrors: Record<string, boolean> = {}
    
    if (!selfieFile) newErrors.selfie = true
    if (!aadharFrontFile) newErrors.aadharFront = true
    if (!aadharBackFile) newErrors.aadharBack = true
    if (!panFile) newErrors.pan = true
    if (!bankName) newErrors.bankName = true
    if (!accountNumber) newErrors.accountNumber = true
    if (!ifscCode) newErrors.ifscCode = true
    if (!accountHolderName) newErrors.accountHolderName = true
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Submit KYC documents
    setIsLoading(true)
    
    // In a real app, this would upload files to Supabase Storage
    // and save bank details in the database
    setTimeout(() => {
      onContinue()
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3">
          <i className="fas fa-arrow-left text-text-secondary"></i>
        </button>
        <h2 className="text-xl font-semibold">Complete KYC</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-[#F0F0F8] rounded-lg p-4 mb-6">
          <p className="text-sm text-text-secondary">
            Please complete KYC verification to start using InstaINR services. This information is securely stored and will not be shared with third parties.
          </p>
        </div>
        
        <h3 className="text-lg font-semibold mb-3">Identity Verification</h3>
        
        {/* Selfie Upload */}
        <div className="mb-4">
          <label className="text-sm text-text-tertiary block mb-2">Selfie</label>
          <div 
            className={`border-2 ${errors.selfie ? 'border-red-500' : 'border-dashed border-border'} rounded-lg p-6 flex flex-col items-center text-center cursor-pointer`}
            onClick={() => document.getElementById("upload-selfie")?.click()}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              selfieFile ? "bg-success text-white" : "bg-[#F0F0F8] text-primary"
            }`}>
              <i className={`fas ${selfieFile ? "fa-check" : "fa-upload"}`}></i>
            </div>
            <div className="font-medium mb-1">{selfieFile ? selfieFile.name : "Upload Selfie"}</div>
            <div className="text-xs text-text-tertiary">
              {selfieFile ? "Click to change" : "JPG or PNG (Max 5MB)"}
            </div>
            <input
              type="file"
              id="upload-selfie"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handleSelfieFileChange}
            />
          </div>
          {errors.selfie && <p className="text-red-500 text-xs mt-1">Please upload your selfie</p>}
        </div>
        
        {/* Aadhar Front Upload */}
        <div className="mb-4">
          <label className="text-sm text-text-tertiary block mb-2">Aadhar Card (Front)</label>
          <div 
            className={`border-2 ${errors.aadharFront ? 'border-red-500' : 'border-dashed border-border'} rounded-lg p-6 flex flex-col items-center text-center cursor-pointer`}
            onClick={() => document.getElementById("upload-aadhar-front")?.click()}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              aadharFrontFile ? "bg-success text-white" : "bg-[#F0F0F8] text-primary"
            }`}>
              <i className={`fas ${aadharFrontFile ? "fa-check" : "fa-upload"}`}></i>
            </div>
            <div className="font-medium mb-1">{aadharFrontFile ? aadharFrontFile.name : "Upload Front Side"}</div>
            <div className="text-xs text-text-tertiary">
              {aadharFrontFile ? "Click to change" : "JPG, PNG or PDF (Max 5MB)"}
            </div>
            <input
              type="file"
              id="upload-aadhar-front"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleAadharFrontFileChange}
            />
          </div>
          {errors.aadharFront && <p className="text-red-500 text-xs mt-1">Please upload the front of your Aadhar card</p>}
        </div>
        
        {/* Aadhar Back Upload */}
        <div className="mb-4">
          <label className="text-sm text-text-tertiary block mb-2">Aadhar Card (Back)</label>
          <div 
            className={`border-2 ${errors.aadharBack ? 'border-red-500' : 'border-dashed border-border'} rounded-lg p-6 flex flex-col items-center text-center cursor-pointer`}
            onClick={() => document.getElementById("upload-aadhar-back")?.click()}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              aadharBackFile ? "bg-success text-white" : "bg-[#F0F0F8] text-primary"
            }`}>
              <i className={`fas ${aadharBackFile ? "fa-check" : "fa-upload"}`}></i>
            </div>
            <div className="font-medium mb-1">{aadharBackFile ? aadharBackFile.name : "Upload Back Side"}</div>
            <div className="text-xs text-text-tertiary">
              {aadharBackFile ? "Click to change" : "JPG, PNG or PDF (Max 5MB)"}
            </div>
            <input
              type="file"
              id="upload-aadhar-back"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleAadharBackFileChange}
            />
          </div>
          {errors.aadharBack && <p className="text-red-500 text-xs mt-1">Please upload the back of your Aadhar card</p>}
        </div>
        
        {/* PAN Card Upload */}
        <div className="mb-6">
          <label className="text-sm text-text-tertiary block mb-2">PAN Card</label>
          <div 
            className={`border-2 ${errors.pan ? 'border-red-500' : 'border-dashed border-border'} rounded-lg p-6 flex flex-col items-center text-center cursor-pointer`}
            onClick={() => document.getElementById("upload-pan")?.click()}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              panFile ? "bg-success text-white" : "bg-[#F0F0F8] text-primary"
            }`}>
              <i className={`fas ${panFile ? "fa-check" : "fa-upload"}`}></i>
            </div>
            <div className="font-medium mb-1">{panFile ? panFile.name : "Upload PAN Card"}</div>
            <div className="text-xs text-text-tertiary">
              {panFile ? "Click to change" : "JPG, PNG or PDF (Max 5MB)"}
            </div>
            <input
              type="file"
              id="upload-pan"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handlePanFileChange}
            />
          </div>
          {errors.pan && <p className="text-red-500 text-xs mt-1">Please upload your PAN card</p>}
        </div>
        
        <h3 className="text-lg font-semibold mb-3">Bank Account Details</h3>
        
        {/* Bank Details Form */}
        <div className="mb-4">
          <label className="text-sm text-text-tertiary block mb-2">Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => {
              setBankName(e.target.value)
              setErrors(prev => ({ ...prev, bankName: false }))
            }}
            className={`h-12 px-4 border ${errors.bankName ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
            placeholder="State Bank of India"
          />
          {errors.bankName && <p className="text-red-500 text-xs mt-1">Please enter your bank name</p>}
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-text-tertiary block mb-2">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value)
              setErrors(prev => ({ ...prev, accountNumber: false }))
            }}
            className={`h-12 px-4 border ${errors.accountNumber ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
            placeholder="Your account number"
          />
          {errors.accountNumber && <p className="text-red-500 text-xs mt-1">Please enter your account number</p>}
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-text-tertiary block mb-2">IFSC Code</label>
          <input
            type="text"
            value={ifscCode}
            onChange={(e) => {
              setIfscCode(e.target.value)
              setErrors(prev => ({ ...prev, ifscCode: false }))
            }}
            className={`h-12 px-4 border ${errors.ifscCode ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
            placeholder="SBIN0001234"
          />
          {errors.ifscCode && <p className="text-red-500 text-xs mt-1">Please enter your bank's IFSC code</p>}
        </div>
        
        <div className="mb-6">
          <label className="text-sm text-text-tertiary block mb-2">Account Holder Name</label>
          <input
            type="text"
            value={accountHolderName}
            onChange={(e) => {
              setAccountHolderName(e.target.value)
              setErrors(prev => ({ ...prev, accountHolderName: false }))
            }}
            className={`h-12 px-4 border ${errors.accountHolderName ? 'border-red-500' : 'border-border'} rounded-lg text-base text-text-primary bg-white w-full`}
            placeholder="John Doe"
          />
          {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">Please enter the account holder name</p>}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input type="checkbox" id="terms" className="mr-2" required />
            <label htmlFor="terms" className="text-sm text-text-secondary">
              I confirm that the information provided is correct and I agree to the <a href="#" className="text-primary">Terms of Service</a>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="primary-button w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin mr-2"></span>
              Processing...
            </span>
          ) : (
            "Complete KYC"
          )}
        </button>
      </form>
    </div>
  )
}