"use client"

import Image from "next/image"

interface HeaderProps {
  userInitial?: string
}

export default function Header({ userInitial }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center">
        <Image src="/images/Instainrlogo.png" alt="InstaINR Logo" width={32} height={32} className="rounded-lg mr-3" />
        <h1 className="text-xl font-semibold">InstaINR</h1>
      </div>
      <div>
        {userInitial ? (
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
            {userInitial}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#F0F0F8] flex items-center justify-center">
            <i className="fas fa-user text-primary"></i>
          </div>
        )}
      </div>
    </header>
  )
}

