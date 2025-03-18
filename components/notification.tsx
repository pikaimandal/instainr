"use client"

import { useEffect, useState } from "react"

interface NotificationProps {
  message: string
  type: "success" | "error" | "info"
  onClose: () => void
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show notification
    setTimeout(() => {
      setIsVisible(true)
    }, 10)

    // Hide notification after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-lg py-3 px-5 shadow-lg z-50 max-w-[90%] transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[100px] opacity-0"
      }`}
    >
      <div className="flex items-center">
        <i
          className={`fas ${
            type === "success"
              ? "fa-check-circle text-success"
              : type === "error"
                ? "fa-exclamation-circle text-danger"
                : "fa-info-circle text-primary"
          } mr-3`}
        ></i>
        <span>{message}</span>
      </div>
    </div>
  )
}

