"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-primary flex justify-center items-center z-50 animate-fadeOut">
      <div className="flex flex-col items-center text-white">
        <div className="w-[120px] h-[120px] bg-white rounded-[24px] flex justify-center items-center mb-5">
          <Image src="/images/Instainrlogosplash.png" alt="InstaINR Logo" width={100} height={100} />
        </div>
        <h1 className="text-3xl font-bold mb-2">InstaINR</h1>
        <p className="text-base font-normal mb-8">Convert your crypto to INR instantly</p>
        <div className="w-10 h-10 border-4 border-white/30 rounded-full border-t-white animate-spin"></div>
      </div>
    </div>
  )
}

