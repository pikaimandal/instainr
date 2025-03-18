"use client"

import type React from "react"

import { useState } from "react"

interface KYCScreenProps {
  onBack: () => void
  onContinue: () => void
}

export default function KYCScreen({ onBack, onContinue }: KYCScreenProps) {
  const [documentType, setDocumentType] = useState("aadhaar")
  const [documentNumber, setDocumentNumber] = useState("")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit")
        return
      }
      setFrontFile(file)
    }
  }

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit")
        return
      }
      setBackFile(file)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">Complete KYC</h2>

      <div className="mb-6">
        <div className="h-1 bg-border rounded mb-4 relative">
          <div className="h-1 bg-primary rounded absolute top-0 left-0" style={{ width: "66%" }}></div>
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col items-center flex-1">
            <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs mb-2">
              1
            </div>
            <div className="text-xs text-text-tertiary">Personal Info</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mb-2">
              2
            </div>
            <div className="text-xs text-primary font-medium">Documents</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-6 h-6 rounded-full bg-border text-text-tertiary flex items-center justify-center text-xs mb-2">
              3
            </div>
            <div className="text-xs text-text-tertiary">Verification</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col mb-4">
          <label className="text-sm text-text-tertiary mb-2">Document Type</label>
          <div className="relative">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="h-12 px-4 border border-border rounded-lg text-base text-text-primary bg-white w-full appearance-none"
            >
              <option value="aadhaar">Aadhaar Card</option>
              <option value="pan">PAN Card</option>
              <option value="passport">Passport</option>
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none"></i>
          </div>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm text-text-tertiary mb-2">Document Number</label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Enter document number"
            className="h-12 px-4 border border-border rounded-lg text-base text-text-primary bg-white w-full"
          />
        </div>

        <div className="flex flex-col gap-4 my-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center text-center cursor-pointer"
            onClick={() => document.getElementById("upload-front")?.click()}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                frontFile ? "bg-success text-white" : "bg-[#F0F0F8] text-primary"
              }`}
            >
              <i className={`fas ${frontFile ? "fa-check" : "fa-upload"}`}></i>
            </div>
            <div className="font-medium mb-1">{frontFile ? frontFile.name : "Upload Front Side"}</div>
            <div className="text-xs text-text-tertiary">
              {frontFile ? "Click to change" : "JPG, PNG or PDF (Max 5MB)"}
            </div>
            <input
              type="file"
              id="upload-front"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFrontFileChange}
            />
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center text-center cursor-pointer"
            onClick={() => document.getElementById("upload-back")?.click()}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                backFile ? "bg-success text-white" : "bg-[#F0F0F8] text-primary"
              }`}
            >
              <i className={`fas ${backFile ? "fa-check" : "fa-upload"}`}></i>
            </div>
            <div className="font-medium mb-1">{backFile ? backFile.name : "Upload Back Side"}</div>
            <div className="text-xs text-text-tertiary">
              {backFile ? "Click to change" : "JPG, PNG or PDF (Max 5MB)"}
            </div>
            <input
              type="file"
              id="upload-back"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleBackFileChange}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={onBack} className="secondary-button w-[48%]">
            Back
          </button>
          <button onClick={onContinue} className="primary-button w-[48%]">
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

