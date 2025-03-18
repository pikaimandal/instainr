"use client"

interface NavigationProps {
  activeScreen: string
  onScreenChange: (screen: string) => void
}

export default function Navigation({ activeScreen, onScreenChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card flex justify-around py-3 border-t border-border z-10">
      <button
        className={`nav-item ${activeScreen === "home-screen" ? "active" : ""}`}
        onClick={() => onScreenChange("home-screen")}
      >
        <i className="fas fa-exchange-alt"></i>
        <span>Convert</span>
      </button>
      <button
        className={`nav-item ${activeScreen === "history-screen" ? "active" : ""}`}
        onClick={() => onScreenChange("history-screen")}
      >
        <i className="fas fa-history"></i>
        <span>History</span>
      </button>
      <button
        className={`nav-item ${activeScreen === "profile-screen" ? "active" : ""}`}
        onClick={() => onScreenChange("profile-screen")}
      >
        <i className="fas fa-user"></i>
        <span>Profile</span>
      </button>
    </nav>
  )
}

