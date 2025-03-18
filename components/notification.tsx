"use client"

import { useEffect } from "react"

interface NotificationProps {
  message: string
  type: "success" | "error" | "info"
  onClose: () => void
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    // Auto-dismiss notification after 5 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [onClose])
  
  const getIcon = () => {
    switch (type) {
      case "success":
        return <i className="fas fa-check-circle"></i>
      case "error":
        return <i className="fas fa-exclamation-circle"></i>
      case "info":
        return <i className="fas fa-info-circle"></i>
    }
  }
  
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-success"
      case "error":
        return "bg-red-500"
      case "info":
        return "bg-primary"
    }
  }
  
  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center items-center px-4 z-50">
      <div className={`${getBackgroundColor()} text-white py-3 px-4 rounded-lg shadow-lg flex items-center max-w-md w-full`}>
        <span className="mr-2">{getIcon()}</span>
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="ml-3 bg-transparent border-none text-white cursor-pointer">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  )
}

