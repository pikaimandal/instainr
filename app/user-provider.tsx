"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getUser, setUser as storeUser, User } from "../lib/store"

// Define the context shape
interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
})

// Hook for components to easily access the user context
export const useUserContext = () => useContext(UserContext)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from storage on initial render
  useEffect(() => {
    const loadUser = () => {
      const storedUser = getUser()
      if (storedUser) {
        setUser(storedUser)
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  // Update stored user when context changes
  const updateUser = (newUser: User | null) => {
    setUser(newUser)
    storeUser(newUser)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: updateUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
} 