"use client"

import Image from "next/image"

interface HeaderProps {
  onProfileClick: () => void
}

export default function Header({ onProfileClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center">
        <Image src="/images/Instainrlogo.png" alt="InstaINR Logo" width={32} height={32} className="rounded-lg mr-3" />
        <h1 className="text-xl font-semibold">InstaINR</h1>
      </div>
      <div>
        <button
          onClick={onProfileClick}
          className="bg-transparent border-none cursor-pointer flex items-center justify-center"
        >
          <Image src="/images/profile.png" alt="Profile" width={32} height={32} className="rounded-full" />
        </button>
      </div>
    </header>
  )
}

